import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { FeedbackCard } from "./FeedbackCard";

interface FeedbackItem {
  id: string;
  text: string;
  type: "positive" | "negative" | "opportunity";
}

interface FeedbackColumnProps {
  title: string;
  type: "positive" | "negative" | "opportunity";
  items: FeedbackItem[];
  onAddItem: (text: string, type: "positive" | "negative" | "opportunity") => void;
  onEditItem: (id: string, newText: string) => void;
  onDeleteItem: (id: string) => void;
  icon: React.ReactNode;
}

export const FeedbackColumn = ({
  title,
  type,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  icon
}: FeedbackColumnProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState("");

  const handleAdd = () => {
    if (newText.trim()) {
      onAddItem(newText.trim(), type);
      setNewText("");
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewText("");
    setIsAdding(false);
  };

  const getHeaderStyles = () => {
    switch (type) {
      case "positive":
        return "bg-gradient-positive text-positive-foreground";
      case "negative":
        return "bg-gradient-negative text-negative-foreground";
      case "opportunity":
        return "bg-gradient-opportunity text-opportunity-foreground";
      default:
        return "";
    }
  };

  const getButtonStyles = () => {
    switch (type) {
      case "positive":
        return "border-positive/30 text-positive hover:bg-positive/10";
      case "negative":
        return "border-negative/30 text-negative hover:bg-negative/10";
      case "opportunity":
        return "border-opportunity/30 text-opportunity hover:bg-opportunity/10";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-elegant">
        <CardHeader className={`${getHeaderStyles()} rounded-t-lg`}>
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {!isAdding ? (
            <Button
              onClick={() => setIsAdding(true)}
              variant="outline"
              className={`w-full ${getButtonStyles()}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {title.toLowerCase()}
            </Button>
          ) : (
            <div className="space-y-3">
              <Textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder={`What ${title.toLowerCase()} would you like to share?`}
                className="min-h-[80px] resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={handleAdd} className="flex-1">
                  Add
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {items.map((item) => (
          <FeedbackCard
            key={item.id}
            id={item.id}
            text={item.text}
            type={item.type}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
          />
        ))}
      </div>
    </div>
  );
};