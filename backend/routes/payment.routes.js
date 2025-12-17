const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment.model');
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const { protect } = require('../middleware/auth.middleware');
const sendEmail = require('../utils/email.util');

// @desc    Créer une session de paiement Stripe
// @route   POST /api/payments/create-checkout-session
// @access  Private
router.post('/create-checkout-session', protect, async (req, res) => {
  try {
    const { courseId, discountCode } = req.body;

    // Récupérer le cours
    const course = await Course.findById(courseId).populate('instructor', 'profile.firstName profile.lastName');
    
    if (!course) {
      return res.status(404).json({ success: false, error: 'Cours non trouvé' });
    }

    // Vérifier si déjà inscrit
    const alreadyEnrolled = req.user.enrolledCourses.some(
      e => e.course.toString() === courseId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ 
        success: false, 
        error: 'Vous êtes déjà inscrit à ce cours' 
      });
    }

    // Calculer le prix (avec réduction si applicable)
    let finalPrice = course.price;
    let discountInfo = null;

    if (course.discount?.percentage && course.discount?.validUntil > new Date()) {
      finalPrice = course.price * (1 - course.discount.percentage / 100);
      discountInfo = {
        percentage: course.discount.percentage,
        amountSaved: course.price - finalPrice
      };
    }

    // Si cours gratuit, inscription directe
    if (finalPrice === 0) {
      req.user.enrolledCourses.push({
        course: courseId,
        enrolledAt: new Date(),
        progress: 0
      });
      await req.user.save();

      // Incrémenter le compteur d'étudiants
      await Course.findByIdAndUpdate(courseId, {
        $inc: { 'stats.studentsCount': 1 }
      });

      return res.status(200).json({
        success: true,
        message: 'Inscription gratuite réussie',
        enrolled: true
      });
    }

    // Créer ou récupérer le client Stripe
    let stripeCustomerId;
    
    // Chercher si l'utilisateur a déjà un customer Stripe
    const existingPayment = await Payment.findOne({ 
      user: req.user.id,
      stripeCustomerId: { $exists: true }
    });

    if (existingPayment?.stripeCustomerId) {
      stripeCustomerId = existingPayment.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.profile.firstName} ${req.user.profile.lastName}`,
        metadata: { userId: req.user.id }
      });
      stripeCustomerId = customer.id;
    }

    // Créer la session Checkout
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'mad',
          product_data: {
            name: course.title,
            description: course.shortDescription || course.description.substring(0, 200),
            images: []
          },
          unit_amount: Math.round(finalPrice * 100) // Stripe utilise les centimes
        },
        quantity: 1
      }],
      metadata: {
        courseId: courseId,
        userId: req.user.id,
        discountCode: discountCode || ''
      },
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${course.slug}?payment=cancelled`,
      locale: 'fr'
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Erreur création session:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Webhook Stripe
// @route   POST /api/payments/webhook
// @access  Public (sécurisé par signature Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Erreur webhook signature:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Traiter les événements
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      
      try {
        const { courseId, userId } = session.metadata;

        // Créer le paiement
        const payment = await Payment.create({
          user: userId,
          course: courseId,
          amount: session.amount_total / 100,
          currency: session.currency.toUpperCase(),
          stripePaymentIntentId: session.payment_intent,
          stripeCustomerId: session.customer,
          status: 'succeeded',
          paidAt: new Date()
        });

        // Inscrire l'utilisateur au cours
        await User.findByIdAndUpdate(userId, {
          $push: {
            enrolledCourses: {
              course: courseId,
              enrolledAt: new Date(),
              progress: 0
            }
          }
        });

        // Incrémenter le compteur d'étudiants
        const course = await Course.findByIdAndUpdate(courseId, {
          $inc: { 'stats.studentsCount': 1 }
        });

        // Récupérer l'utilisateur pour l'email
        const user = await User.findById(userId);

        // Envoyer email de confirmation
        await sendEmail({
          email: user.email,
          template: 'enrollmentConfirmation',
          data: {
            name: user.profile.firstName,
            courseName: course.title,
            instructor: `${course.instructor.profile?.firstName || ''} ${course.instructor.profile?.lastName || ''}`,
            duration: course.formattedDuration,
            courseUrl: `${process.env.FRONTEND_URL}/learn/${course.slug}`
          }
        });

        // Envoyer reçu
        await sendEmail({
          email: user.email,
          template: 'paymentReceipt',
          data: {
            name: user.profile.firstName,
            invoiceNumber: payment.invoice.number,
            date: new Date().toLocaleDateString('fr-MA'),
            courseName: course.title,
            amount: payment.amount,
            currency: payment.currency
          }
        });

        console.log(`✅ Paiement traité: ${payment._id}`);

      } catch (error) {
        console.error('Erreur traitement paiement:', error);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      console.log(`❌ Paiement échoué: ${paymentIntent.id}`);
      break;
    }

    default:
      console.log(`Event non géré: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

// @desc    Vérifier le statut d'un paiement
// @route   GET /api/payments/verify/:sessionId
// @access  Private
router.get('/verify/:sessionId', protect, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

    if (session.payment_status === 'paid') {
      res.status(200).json({
        success: true,
        paid: true,
        courseId: session.metadata.courseId
      });
    } else {
      res.status(200).json({
        success: true,
        paid: false
      });
    }

  } catch (error) {
    console.error('Erreur vérification:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Historique des paiements de l'utilisateur
// @route   GET /api/payments/my-payments
// @access  Private
router.get('/my-payments', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('course', 'title slug thumbnail')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments.map(p => p.toSafeObject())
    });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// @desc    Demander un remboursement
// @route   POST /api/payments/:id/refund
// @access  Private
router.post('/:id/refund', protect, async (req, res) => {
  try {
    const payment = await Payment.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Paiement non trouvé' });
    }

    // Vérifier délai de remboursement (14 jours max)
    const daysSincePurchase = (Date.now() - payment.paidAt) / (1000 * 60 * 60 * 24);
    
    if (daysSincePurchase > 14) {
      return res.status(400).json({
        success: false,
        error: 'Délai de remboursement dépassé (14 jours maximum)'
      });
    }

    // Créer le remboursement Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: 'requested_by_customer'
    });

    // Mettre à jour le paiement
    payment.status = 'refunded';
    payment.refund = {
      amount: payment.amount,
      reason: req.body.reason || 'Demande client',
      stripeRefundId: refund.id,
      refundedAt: new Date()
    };
    await payment.save();

    // Retirer l'inscription au cours
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { enrolledCourses: { course: payment.course } }
    });

    // Décrémenter le compteur d'étudiants
    await Course.findByIdAndUpdate(payment.course, {
      $inc: { 'stats.studentsCount': -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Remboursement effectué'
    });

  } catch (error) {
    console.error('Erreur remboursement:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
