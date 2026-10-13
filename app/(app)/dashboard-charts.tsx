'use client'

import * as React from 'react'
import { TrendingUp, Package, CreditCard, Activity, Calendar, BarChart3, Target, Wallet, CircleAlert, Inbox, PieChart as PieChartIcon, Funnel as FunnelIcon, Radar as RadarIcon } from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel as RechartsFunnel,
  LabelList,
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { cn } from '@/lib/utils'

const fmtBRL = (v: number | null | undefined) =>
  (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

const fmtNumber = (v: number | null | undefined) => (v ?? 0).toLocaleString('pt-BR')

const DARK_COLORS = [
  '#dc2626', // vermelho primary (triad)
  '#0891b2', // ciano
  '#8b5cf6', // violeta
  '#10b981', // emerald
  '#f59e0b', // âmbar
  '#f43f5e', // rose
  '#3b82f6', // azul
  '#ec4899', // rosa
  '#84cc16', // limão
  '#14b8a6', // teal
]

type KV = { name: string; value: number }

export type DashboardChartsProps = {
  isAdmin: boolean
  paymentMethodData: KV[]
  topProducts: (KV & { quantity: number })[]
  dailyTrend: { date: string; receita: number; custo: number; lucro: number }[]
  weekdaySales: { day: string; manha: number; tarde: number; noite: number }[]
  radarData: { subject: string; A: number; fullMark: number }[]
  metaMes: { percent: number; meta: number; atingido: number }
  commandsHealth: {
    pago: number; aberto: number; vencido: number
    pagoCount: number; abertoCount: number; vencidoCount: number
  }
  stockHealth: {
    adequado: number; baixo: number; zerado: number
    adequadoCount: number; baixoCount: number; zeradoCount: number
  }
  expenseCategory: KV[]
}

/* ===================== HELPERS ===================== */

function EmptyState({ title, tip, icon: Icon }: { title: string; tip?: string; icon?: any }) {
  const I = Icon ?? Inbox
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-gray-500">
      <I className="h-10 w-10 opacity-40" />
      <p className="text-sm font-medium text-gray-400">{title}</p>
      {tip && <p className="text-xs max-w-xs">{tip}</p>}
    </div>
  )
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/15 text-red-500">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  )
}

/* ===================== CHARTS ===================== */

/* ---------- 1. PIZZA: métodos de pagamento ---------- */
function PaymentPie({ data }: { data: KV[] }) {
  const chartConfig = data.reduce<ChartConfig>((acc, cur, i) => {
    acc[cur.name] = { label: cur.name, color: DARK_COLORS[i % DARK_COLORS.length] }
    return acc
  }, {})

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-red-500" />
          Vendas por Método de Pagamento
        </CardTitle>
        <CardDescription className="text-gray-500 text-xs">Distribuição no mês atual</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            title="Sem vendas no período"
            tip="Realize vendas com diferentes métodos de pagamento para ver a distribuição."
            icon={CreditCard}
          />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[320px] w-full"
            initialDimension={{ width: 560, height: 320 }}
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(v, n) => (
                      <div className="flex w-full flex-wrap items-stretch gap-2">
                        <div className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: chartConfig[String(n)]?.color ?? '#fff' }} />
                        <div className="flex flex-1 justify-between leading-none">
                          <span className="text-gray-300">{n}</span>
                          <span className="font-mono font-medium text-white tabular-nums">
                            {fmtBRL(Number(v))}
                          </span>
                        </div>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={2}
                strokeOpacity={0}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={{ stroke: '#6b7280', strokeWidth: 1 }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={DARK_COLORS[index % DARK_COLORS.length]}
                    stroke="#0a0a0a"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                verticalAlign="bottom"
                height={36}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------- 2. DONUT: despesas por categoria (admin) ---------- */
function ExpenseDonut({ data, isAdmin }: { data: KV[]; isAdmin: boolean }) {
  const chartConfig = data.reduce<ChartConfig>((acc, cur, i) => {
    acc[cur.name] = { label: cur.name, color: DARK_COLORS[(i + 3) % DARK_COLORS.length] }
    return acc
  }, {})

  if (!isAdmin) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Wallet className="h-4 w-4 text-purple-500" />
            Despesas por Categoria
          </CardTitle>
          <CardDescription className="text-gray-500 text-xs">Visão exclusiva do administrador</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState title="Acesso restrito" tip="Apenas administradores podem visualizar dados de despesas." icon={CircleAlert} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Wallet className="h-4 w-4 text-purple-500" />
          Despesas por Categoria
        </CardTitle>
        <CardDescription className="text-gray-500 text-xs">Total no mês atual</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            title="Sem despesas no período"
            tip="Cadastre despesas com categorias para visualizar esta análise."
            icon={Wallet}
          />
        ) : (
          <ChartContainer config={chartConfig} className="h-[320px] w-full" initialDimension={{ width: 560, height: 320 }}>
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(v, n) => (
                      <div className="flex w-full items-stretch gap-2">
                        <div className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: chartConfig[String(n)]?.color ?? '#fff' }} />
                        <div className="flex flex-1 justify-between leading-none">
                          <span className="text-gray-300">{n}</span>
                          <span className="font-mono font-medium text-white tabular-nums">{fmtBRL(Number(v))}</span>
                        </div>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={100}
                cornerRadius={4}
                paddingAngle={1}
                strokeOpacity={0}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={DARK_COLORS[(index + 3) % DARK_COLORS.length]}
                    stroke="#0a0a0a"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} verticalAlign="bottom" height={36} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------- 3. PIRÂMIDE (Funnel): Top produtos ---------- */
function ProductsPyramid({ data }: { data: (KV & { quantity: number })[] }) {
  const chartConfig: ChartConfig = {
    value: { label: 'Receita', color: '#dc2626' },
    quantity: { label: 'Qtd.', color: '#8b5cf6' },
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-violet-500" />
            Pirâmide de Produtos
          </CardTitle>
          <CardDescription className="text-gray-500 text-xs">Top {data.length} mais vendidos do mês por receita</CardDescription>
        </div>
        <span className="text-xs text-gray-500 hidden md:inline">Formato de pirâmide: maior receita no topo</span>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            title="Sem itens vendidos no mês"
            tip="Realize vendas para ver o ranking de produtos no formato pirâmide."
            icon={Package}
          />
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[420px] w-full" initialDimension={{ width: 900, height: 420 }}>
              <FunnelChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(v, n, _it, idx, payload) => {
                        const row = payload as any
                        return (
                          <div className="grid gap-1.5 min-w-[240px]">
                            <div className="flex items-center gap-2">
                              <Package className="h-3.5 w-3.5 text-gray-400" />
                              <span className="font-semibold text-white truncate">{row?.name ?? 'Produto'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Receita:</span>
                              <span className="font-mono text-red-400">{fmtBRL(row?.value ?? Number(v))}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">Quantidade:</span>
                              <span className="font-mono text-violet-400">{fmtNumber(row?.quantity ?? 0)} un</span>
                            </div>
                          </div>
                        )
                      }}
                    />
                  }
                />
                <RechartsFunnel
                  data={data}
                  dataKey="value"
                  isAnimationActive
                  stroke="#0a0a0a"
                  strokeWidth={2}
                >
                  <LabelList
                    position="left"
                    dataKey="name"
                    fill="#e5e7eb"
                    stroke="none"
                    fontSize={11}
                    width={140}
                    formatter={(v: string) => (v.length > 22 ? v.slice(0, 21) + '…' : v)}
                  />
                  <LabelList
                    position="right"
                    dataKey="value"
                    fill="#fecaca"
                    stroke="none"
                    fontSize={11}
                    formatter={(v: number) => fmtBRL(v)}
                  />
                  {data.map((_d, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={DARK_COLORS[idx % DARK_COLORS.length]}
                      fillOpacity={1 - idx * 0.06}
                    />
                  ))}
                </RechartsFunnel>
              </FunnelChart>
            </ChartContainer>
            {data.length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
                {data.slice(0, 5).map((p, i) => (
                  <div key={p.name} className="rounded-lg border border-gray-800 bg-gray-950/50 px-2.5 py-2">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase text-gray-500">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm text-[10px] font-bold text-white"
                        style={{ background: DARK_COLORS[i % DARK_COLORS.length] }}>
                        {i + 1}
                      </span>
                      <span className="truncate">Qtd {fmtNumber(p.quantity)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-white">{p.name.length > 18 ? p.name.slice(0, 17) + '…' : p.name}</p>
                    <p className="font-mono text-[11px] text-red-400">{fmtBRL(p.value)}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------- 4. CÍRCULOS: 3 Radial Bars ---------- */

type RadialCircleProps = {
  title: React.ReactNode
  value: number
  color: string
  subTitle?: string
  badges?: { label: string; value: number | string; color: string }[]
}

function RadialCircle({ title, value, color, subTitle, badges }: RadialCircleProps) {
  const data = [{ name: 'v', value: Math.max(0, Math.min(100, value)), fill: color }]
  const chartConfig: ChartConfig = { v: { label: 'Progresso', color } }
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-0">
        <CardTitle className="text-white text-sm">{title}</CardTitle>
        {subTitle && <CardDescription className="text-gray-500 text-xs">{subTitle}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-3">
        <ChartContainer config={chartConfig} className="h-[200px] w-full" initialDimension={{ width: 320, height: 200 }}>
          <RadialBarChart
            innerRadius="60%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            barSize={18}
          >
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(v) => <span className="font-mono font-semibold text-white">{Number(v).toFixed(0)}%</span>}
                />
              }
            />
            <RadialBar
              background={{ fill: '#1f2937' }}
              data={data}
              cornerRadius={10}
              isAnimationActive
            />
          </RadialBarChart>
        </ChartContainer>
        <div className="flex flex-col items-center gap-2 -mt-16 pb-6 pointer-events-none select-none">
          <div className="text-3xl font-bold" style={{ color }}>
            {value.toFixed(0)}%
          </div>
        </div>
        {badges && badges.length > 0 && (
          <div className="mt-1 grid grid-cols-3 gap-1.5">
            {badges.map((b) => (
              <div key={b.label} className="rounded-md border border-gray-800 bg-gray-950/60 px-2 py-1.5 text-center">
                <div className="text-[10px] uppercase tracking-wide" style={{ color: b.color }}>
                  {b.label}
                </div>
                <div className="font-mono text-xs font-semibold text-white">{b.value}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------- 5. ÁREA: Tendência últimos 30 dias ---------- */
function TrendArea({ data, isAdmin }: { data: DashboardChartsProps['dailyTrend']; isAdmin: boolean }) {
  const series = isAdmin
    ? [
        { key: 'receita', label: 'Receita', color: '#10b981' },
        { key: 'custo', label: 'Custo', color: '#f43f5e' },
        { key: 'lucro', label: 'Lucro', color: '#3b82f6' },
      ]
    : [{ key: 'receita', label: 'Receita', color: '#10b981' }]

  const chartConfig: ChartConfig = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }])
  )

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          Evolução dos Últimos 30 Dias
        </CardTitle>
        <CardDescription className="text-gray-500 text-xs">
          {isAdmin ? 'Receita, custo e lucro diário' : 'Receita diária'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.every((d) => d.receita === 0 && d.custo === 0) ? (
          <EmptyState
            title="Sem movimentação nos últimos 30 dias"
            tip="Após criar vendas (e despesas, se admin), o gráfico exibirá a tendência temporal."
            icon={Calendar}
          />
        ) : (
          <ChartContainer config={chartConfig} className="h-[320px] w-full" initialDimension={{ width: 1100, height: 320 }}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                {series.map((s) => (
                  <linearGradient key={`g-${s.key}`} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} stroke="#1f2937" strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={20} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickFormatter={(v) => (Number(v) >= 1000 ? `R$${(Number(v) / 1000).toFixed(1)}k` : `R$${v}`)}
                width={70}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(v, n) => (
                      <div className="flex w-full justify-between leading-none gap-4">
                        <span className="text-gray-300">{n}</span>
                        <span className="font-mono font-medium text-white tabular-nums">{fmtBRL(Number(v))}</span>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} verticalAlign="top" height={24} />
              {series.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  fill={`url(#grad-${s.key})`}
                  strokeWidth={2.2}
                  connectNulls
                  isAnimationActive
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------- 6. BARRAS AGRUPADAS: Dia da semana + período ---------- */
function WeekdayBars({ data }: { data: DashboardChartsProps['weekdaySales'] }) {
  const chartConfig: ChartConfig = {
    manha: { label: 'Manhã', color: '#f59e0b' },
    tarde: { label: 'Tarde', color: '#dc2626' },
    noite: { label: 'Noite', color: '#8b5cf6' },
  }
  const empty = data.every((d) => d.manha === 0 && d.tarde === 0 && d.noite === 0)
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-amber-500" />
          Vendas por Dia e Período
        </CardTitle>
        <CardDescription className="text-gray-500 text-xs">Total do mês agrupado por turno</CardDescription>
      </CardHeader>
      <CardContent>
        {empty ? (
          <EmptyState
            title="Sem dados suficientes"
            tip="Ao longo do mês o gráfico vai exibir como suas vendas se distribuem por dia e turno."
            icon={Calendar}
          />
        ) : (
          <ChartContainer config={chartConfig} className="h-[320px] w-full" initialDimension={{ width: 600, height: 320 }}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#1f2937" strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickFormatter={(v) => (Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(1)}k` : Number(v))}
                width={60}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(v, n) => (
                      <div className="flex w-full justify-between leading-none gap-4">
                        <span className="text-gray-300">{n}</span>
                        <span className="font-mono font-medium text-white tabular-nums">{fmtBRL(Number(v))}</span>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} verticalAlign="top" height={28} />
              <Bar dataKey="manha" name="Manhã" radius={[6, 6, 0, 0]} fill={chartConfig.manha.color} isAnimationActive />
              <Bar dataKey="tarde" name="Tarde" radius={[6, 6, 0, 0]} fill={chartConfig.tarde.color} isAnimationActive />
              <Bar dataKey="noite" name="Noite" radius={[6, 6, 0, 0]} fill={chartConfig.noite.color} isAnimationActive />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

/* ---------- 7. RADAR: Performance multi-eixo ---------- */
function PerformanceRadar({ data }: { data: DashboardChartsProps['radarData'] }) {
  const chartConfig: ChartConfig = {
    A: { label: 'Atual', color: '#dc2626' },
  }
  const empty = data.every((d) => d.A === 0)
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <RadarIcon className="h-4 w-4 text-teal-400" />
          Radar de Performance
        </CardTitle>
        <CardDescription className="text-gray-500 text-xs">6 dimensões (índice 0-100)</CardDescription>
      </CardHeader>
      <CardContent>
        {empty ? (
          <EmptyState
            title="Sem dados suficientes para radar"
            tip="Com mais vendas, clientes e movimentações, o radar começa a preencher os eixos."
            icon={Activity}
          />
        ) : (
          <ChartContainer config={chartConfig} className="h-[320px] w-full" initialDimension={{ width: 560, height: 320 }}>
            <RadarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(v, n) => (
                      <div className="flex w-full justify-between leading-none gap-4">
                        <span className="text-gray-300">{n}</span>
                        <span className="font-mono font-medium text-white tabular-nums">{Number(v).toFixed(0)}/100</span>
                      </div>
                    )}
                  />
                }
              />
              <PolarGrid stroke="#374151" strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#d1d5db', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} tickCount={5} />
              <RechartsRadar
                name="Índice"
                dataKey="A"
                stroke={chartConfig.A.color}
                fill={chartConfig.A.color}
                fillOpacity={0.35}
                strokeWidth={2}
                isAnimationActive
              />
            </RadarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

/* ===================== EXPORTAÇÃO ===================== */

export function DashboardCharts(props: DashboardChartsProps) {
  const {
    isAdmin,
    paymentMethodData,
    topProducts,
    dailyTrend,
    weekdaySales,
    radarData,
    metaMes,
    commandsHealth,
    stockHealth,
    expenseCategory,
  } = props

  return (
    <div className="space-y-6">
      {/* ===== Linha 1: Pizza + Donut ===== */}
      <div>
        <SectionTitle
          icon={PieChartIcon}
          title="Análise de Receitas"
          subtitle="Como suas vendas e custos se distribuem este mês"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
          <PaymentPie data={paymentMethodData} />
          <ExpenseDonut data={expenseCategory} isAdmin={isAdmin} />
        </div>
      </div>

      {/* ===== Linha 2: Pirâmide ===== */}
      <div>
        <SectionTitle
          icon={FunnelIcon}
          title="Pirâmide de Produtos"
          subtitle="Ranking top produtos por receita no mês — topo = maior valor"
        />
        <div className="mt-3">
          <ProductsPyramid data={topProducts} />
        </div>
      </div>

      {/* ===== Linha 3: 3 Círculos Radial ===== */}
      <div>
        <SectionTitle
          icon={Target}
          title="Saúde do Negócio (Círculos)"
          subtitle="Panorama geral de metas, cobranças e estoque"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <RadialCircle
            title={
              <span className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-red-500" /> Meta do Mês
              </span>
            }
            value={metaMes.percent}
            color="#dc2626"
            subTitle={`Meta ${fmtBRL(metaMes.meta)} • Atingido ${fmtBRL(metaMes.atingido)}`}
            badges={[
              { label: 'Meta', value: fmtBRL(metaMes.meta), color: '#9ca3af' },
              { label: 'Atingido', value: fmtBRL(metaMes.atingido), color: '#10b981' },
              { label: 'Diferença', value: fmtBRL(Math.max(0, metaMes.meta - metaMes.atingido)), color: '#dc2626' },
            ]}
          />
          <RadialCircle
            title={
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-violet-500" /> Status Comandas
              </span>
            }
            value={commandsHealth.pago}
            color="#8b5cf6"
            subTitle="% de comandas já pagas"
            badges={[
              { label: 'Pagas', value: commandsHealth.pagoCount, color: '#10b981' },
              { label: 'Abertas', value: commandsHealth.abertoCount, color: '#f59e0b' },
              { label: 'Vencidas', value: commandsHealth.vencidoCount, color: '#ef4444' },
            ]}
          />
          <RadialCircle
            title={
              <span className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-emerald-500" /> Saúde do Estoque
              </span>
            }
            value={stockHealth.adequado}
            color="#10b981"
            subTitle="% de SKUs acima do nível mínimo"
            badges={[
              { label: 'OK', value: stockHealth.adequadoCount, color: '#10b981' },
              { label: 'Baixo', value: stockHealth.baixoCount, color: '#f59e0b' },
              { label: 'Zerado', value: stockHealth.zeradoCount, color: '#ef4444' },
            ]}
          />
        </div>
      </div>

      {/* ===== Linha 4: Tendência 30 dias ===== */}
      <div>
        <SectionTitle
          icon={TrendingUp}
          title="Desempenho Temporal"
          subtitle="Tendência diária e distribuição semanal"
        />
        <div className="mt-3">
          <TrendArea data={dailyTrend} isAdmin={isAdmin} />
        </div>
      </div>

      {/* ===== Linha 5: Barras semana + Radar ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeekdayBars data={weekdaySales} />
        <PerformanceRadar data={radarData} />
      </div>
    </div>
  )
}
