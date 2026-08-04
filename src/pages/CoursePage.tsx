import CourseTimeline from '../components/CourseTimeline'

export default function CoursePage() {
  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-bamboo">课程路线</h1>
        <p className="text-sm text-gray-500 mt-1">6个月竹笛系统学习，从入门到演奏</p>
      </div>
      <CourseTimeline />
    </div>
  )
}
