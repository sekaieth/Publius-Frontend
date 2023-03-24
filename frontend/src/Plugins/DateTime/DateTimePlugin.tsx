import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $getSelection, $getTextContent, $insertNodes, LexicalEditor, TextNode } from "lexical";
import React from "react";
import { DateTimeNode } from "../../Nodes/DateTimeNode";
import "./DateTimePlugin.css"

interface DateTimeProps{
  date?:Date;
  onCalendarIconClick?: () =>void;
}

function DateTimeComponent({
  date,
  onCalendarIconClick
}: DateTimeProps ) : JSX.Element {
  return (
    <section className="date-time-plugin">
      <button 
      className='ui button'
      type = 'button'
      aria-label="insert-date-and-time"
      title='insert date and time'
      onClick={onCalendarIconClick} 
      >
        <i className="icon calendar"/>
      </button>
      {date?.toLocaleString() }
    </section>
  );
}
function useDateTimeComponent(editor:LexicalEditor,date:Date):JSX.Element {
  const onCalendarIconClick =() => {
    editor.update(()=>{
      const node = new TextNode(date.toLocaleString())
      node.setStyle("color:red; text-decoration:underline;text-decoration:border")
      const devilNode = new TextNode(" ❡ ")
      const newNode = new DateTimeNode (date.toLocaleString());
      const nodes = [node,devilNode,newNode]
      const selection = $getSelection();
      if (selection?.getTextContent()){
        selection.insertText
      } else{
        $insertNodes(nodes) 
      }
    })
  }
return <DateTimeComponent onCalendarIconClick={onCalendarIconClick} date={date}/>
}

export function DateTimePlugin ({
  date = new Date(),
  }: DateTimeProps): JSX.Element {
    const [editor] = useLexicalComposerContext();
    return useDateTimeComponent(editor,date);
  }