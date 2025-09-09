import type { IconType } from "react-icons"

interface StatsCardProps {
  userCount: number
  title: string
  Icon: IconType
}

export function StatsCard({ userCount, title, Icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200">
      <div className="flex items-center gap-4">
        <div className="bg-amber-500 p-3 rounded-xl">
          <Icon className="text-white text-xl" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-600">{title}</h3>
          <p className="text-3xl font-bold text-black">{userCount}</p>
        </div>
      </div>
    </div>
  )
}
