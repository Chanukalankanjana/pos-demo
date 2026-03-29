import { Button } from "@/components/ui/button"
import { featureConfigs, type FeatureKey } from "@/config/features"
import { Sparkles } from "lucide-react"

type UpgradeModalProps = {
  featureKey: FeatureKey | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const UpgradeModal = ({ featureKey, open, onOpenChange }: UpgradeModalProps) => {
  const config = featureKey ? featureConfigs[featureKey] : null

  if (!open || !config) return null

  return (
    <div
      className="fixed inset-y-0 left-72 right-0 z-40 flex items-center justify-center bg-black/50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="sm:max-w-[520px] w-full mx-4 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
          <div className="flex items-start gap-4 px-6 pt-5 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary/80 mb-1">
                Premium feature
              </p>
              <h2 className="text-xl font-semibold leading-tight">Unlock {config.label}</h2>
              <p className="mt-1 text-xs text-slate-300">
                {config.upgradeMessage}
              </p>
            </div>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-200">What you get</p>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  <li>{config.description}</li>
                  <li>Works with your existing POS data and users.</li>
                  <li>Designed for growing restaurants and multi-branch teams.</li>
                </ul>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-primary/25 via-primary/10 to-slate-900 border border-primary/40 p-4 flex flex-col justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-primary-foreground/90">
                    {config.recommendedPlan ?? "Talk to us to enable this feature"}
                  </p>
                  {config.priceHint && (
                    <p className="text-[11px] text-slate-200 mt-1">
                      {config.priceHint}
                    </p>
                  )}
                </div>
                <span className="inline-flex w-fit px-2 py-1 rounded-full bg-slate-950/60 text-[10px] font-semibold tracking-wide uppercase border border-white/10">
                  Add-on feature
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 pt-3 mt-1">
              <Button
                type="button"
                variant="secondary"
                className="bg-slate-800/80 text-slate-100 hover:bg-slate-700 border border-slate-600"
                onClick={() => onOpenChange(false)}
              >
                Maybe later
              </Button>
              <Button
                type="button"
                className="bg-primary text-primary-foreground font-semibold shadow-lg hover:bg-primary/90"
                onClick={() => {
                  window.open("https://vizualabs.com/contact-us/", "_blank")
                  onOpenChange(false)
                }}
              >
                Contact Team
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

