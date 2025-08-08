import { useState } from 'react'
import type React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Calendar, Tag, Plus, Trash2, Save } from 'lucide-react'

/**
 * RetroComposer — lightweight modal to capture Rose/Bud/Thorn entries (up to 5 each)
 * Drop into: src/components/RetroComposer.tsx
 *
 * You control open/close from parent. Provide onSave to persist (e.g., Supabase insert).
 */

export type RetroComposerProps = {
  open: boolean
  onClose: () => void
  onSave: (payload: RetroPayload) => Promise<void> | void
  preset?: Partial<RetroPayload>
}

export type RetroPayload = {
  title: string
  contextType: 'trip' | 'event' | 'daily' | 'personal'
  locationName?: string
  startDate?: string
  endDate?: string
  tags: string[]
  rose: string[]
  bud: string[]
  thorn: string[]
}

const MAX_ITEMS = 5

export default function RetroComposer({ open, onClose, onSave, preset }: RetroComposerProps) {
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(preset?.title ?? '')
  const [contextType, setContextType] = useState<RetroPayload['contextType']>(preset?.contextType ?? 'trip')
  const [locationName, setLocationName] = useState(preset?.locationName ?? '')
  const [startDate, setStartDate] = useState(preset?.startDate ?? '')
  const [endDate, setEndDate] = useState(preset?.endDate ?? '')
  const [tags, setTags] = useState<string[]>(preset?.tags ?? [])
  const [rose, setRose] = useState<string[]>(preset?.rose ?? [''])
  const [bud, setBud] = useState<string[]>(preset?.bud ?? [''])
  const [thorn, setThorn] = useState<string[]>(preset?.thorn ?? [''])

  const addItem = (list: string[], setter: (v: string[]) => void) => {
    if (list.length >= MAX_ITEMS) return
    setter([...list, ''])
  }
  const updateItem = (list: string[], setter: (v: string[]) => void, i: number, val: string) => {
    const next = [...list]; next[i] = val; setter(next)
  }
  const removeItem = (list: string[], setter: (v: string[]) => void, i: number) => {
    const next = list.filter((_, idx) => idx !== i)
    setter(next.length ? next : [''])
  }

  const submit = async () => {
    const payload: RetroPayload = {
      title: title.trim(),
      contextType,
      locationName: locationName.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      tags: tags.map(t => t.trim()).filter(Boolean),
      rose: rose.map(t => t.trim()).filter(Boolean).slice(0, MAX_ITEMS),
      bud: bud.map(t => t.trim()).filter(Boolean).slice(0, MAX_ITEMS),
      thorn: thorn.map(t => t.trim()).filter(Boolean).slice(0, MAX_ITEMS),
    }
    if (!payload.title) return alert('Please add a title')
    setSaving(true)
    try {
      await onSave(payload)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const tagInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget
    if (e.key === 'Enter' && el.value.trim()) {
      e.preventDefault()
      setTags(prev => Array.from(new Set([...prev, el.value.trim()])))
      el.value = ''
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-2 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
              <h2 className="text-base font-semibold">New Retro</h2>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-neutral-100"><X className="h-5 w-5"/></button>
            </div>

            <div className="max-h-[80vh] space-y-4 overflow-y-auto p-4">
              {/* Context */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">Title</label>
                  <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Hawaii family trip" className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">Type</label>
                  <select value={contextType} onChange={e=>setContextType(e.target.value as any)} className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900">
                    <option value="trip">Trip</option>
                    <option value="event">Event</option>
                    <option value="daily">Daily</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">Location</label>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500"><MapPin className="h-4 w-4"/></span>
                    <input value={locationName} onChange={e=>setLocationName(e.target.value)} placeholder="Maui, Hawaii" className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">Start</label>
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-neutral-500"/><input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900"/></div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600">End</label>
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-neutral-500"/><input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900"/></div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600">Tags</label>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-neutral-500"/>
                  <input onKeyDown={tagInputKey} placeholder="Press Enter to add tag (e.g., Travel, Hotel, Hawaii)" className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900"/>
                </div>
                {tags.length>0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map(t => (
                      <span key={t} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-2 py-1 text-xs">
                        {t}
                        <button onClick={()=>setTags(tags.filter(x=>x!==t))} className="rounded-full p-0.5 hover:bg-neutral-100"><X className="h-3.5 w-3.5"/></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* RBT sections */}
              <RBTSection label="Rose" color="rose" items={rose} setItems={setRose} placeholder="Sea turtles at Wailea Beach; gratitude for family" />
              <RBTSection label="Bud" color="emerald" items={bud} setItems={setBud} placeholder="Start a business to sustain our dream life" />
              <RBTSection label="Thorn" color="amber" items={thorn} setItems={setThorn} placeholder="Airport stress; arrive earlier during spring break" />
            </div>

            <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
              <button onClick={onClose} className="rounded-full px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">Cancel</button>
              <button disabled={saving} onClick={submit} className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60">
                <Save className="h-4 w-4"/> {saving ? 'Saving…' : 'Save Retro'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function RBTSection({ label, color, items, setItems, placeholder }: { label: 'Rose'|'Bud'|'Thorn', color: 'rose'|'emerald'|'amber', items: string[], setItems: (v: string[])=>void, placeholder: string }) {
  const colorClass = color === 'rose' ? 'text-rose-700' : color === 'emerald' ? 'text-emerald-700' : 'text-amber-700'
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className={`text-sm font-semibold ${colorClass}`}>{label}</h3>
        <button
          onClick={() => items.length < MAX_ITEMS && setItems([...items, ''])}
          className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
          disabled={items.length >= MAX_ITEMS}
        >
          <Plus className="h-3.5 w-3.5"/> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((val, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={val}
              onChange={e=>{ const next=[...items]; next[i]=e.target.value; setItems(next) }}
              placeholder={i===0? placeholder: ''}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <button onClick={()=>{ const next = items.filter((_,idx)=>idx!==i); setItems(next.length? next: ['']) }} className="rounded-full p-2 hover:bg-neutral-100"><Trash2 className="h-4 w-4"/></button>
          </div>
        ))}
      </div>
    </div>
  )
}
