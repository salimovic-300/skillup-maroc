// src/components/CourseCard.jsx
import { useNavigate } from 'react-router-dom';

export default function CourseCard({ course }) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/cours/${course.slug}`)}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-6xl">
            🎓
          </div>
        )}
        
        {/* Badge catégorie */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
            {course.category}
          </span>
        </div>

        {/* Badge discount */}
        {course.pricing?.discount > 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              -{course.pricing.discount}%
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-semibold text-sm">
              {course.instructor?.firstName?.charAt(0)}
            </span>
          </div>
          <span className="text-sm text-gray-700">
            {course.instructor?.firstName} {course.instructor?.lastName}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span>{course.rating?.average?.toFixed(1) || '5.0'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>{course.stats?.studentsEnrolled || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{course.stats?.totalDuration || 0}h</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t">
          {course.pricing?.discount > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-indigo-600">
                {course.pricing.discountedPrice} DH
              </span>
              <span className="text-sm text-gray-500 line-through">
                {course.pricing.originalPrice} DH
              </span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-indigo-600">
              {course.pricing?.originalPrice || 0} DH
            </span>
          )}
          
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-semibold">
            Voir plus
          </button>
        </div>
      </div>
    </div>
  );
}