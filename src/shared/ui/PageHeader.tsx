export interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
      {description ? <p className="mt-3 text-lg text-fg-muted">{description}</p> : null}
    </header>
  )
}
