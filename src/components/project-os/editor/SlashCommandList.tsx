import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { CommandItemProps } from './slash-command-options'

interface SlashCommandListProps {
  items: CommandItemProps[]
  command: (item: CommandItemProps) => void
}

export const SlashCommandList = forwardRef((props: SlashCommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => {
    setSelectedIndex(0)
  }, [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  if (!props.items.length) {
    return null
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden w-64 animate-in fade-in zoom-in-95 duration-100 flex flex-col p-1">
      <div className="px-2 py-1.5 text-[10px] font-bold tracking-widest uppercase text-zinc-400">
        Blocos Básicos
      </div>
      {props.items.map((item, index) => {
        const isSelected = index === selectedIndex
        return (
          <button
            className={`flex items-center gap-3 px-2 py-2 w-full text-left rounded-lg transition-colors ${
              isSelected ? 'bg-zinc-100 dark:bg-zinc-800' : 'bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
            key={index}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              selectItem(index);
            }}
          >
            <div className={`p-1.5 rounded-md border ${isSelected ? 'bg-white border-zinc-200 text-black dark:bg-zinc-700 dark:border-zinc-600 dark:text-white' : 'bg-zinc-50 border-zinc-100 text-zinc-500 dark:bg-zinc-800/50 dark:border-zinc-800'}`}>
              <item.icon size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.title}</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{item.description}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
})

SlashCommandList.displayName = 'SlashCommandList'
