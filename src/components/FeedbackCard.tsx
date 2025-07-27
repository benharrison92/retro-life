import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Trash2, Check, X } from "lucide-react";

interface FeedbackCardProps {
  id: string;
  text: string;
  type: "positive" | "negative" | "opportunity";
  onEdit: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
}

export const FeedbackCard = ({ id, text, type, onEdit, onDelete }: FeedbackCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };

  const getCardStyles = () => {
    switch (type) {
      case "positive":
        return "border-positive/20 bg-positive-muted hover:shadow-glow-positive";
      case "negative":
        return "border-negative/20 bg-negative-muted hover:shadow-glow-negative";
      case "opportunity":
        return "border-opportunity/20 bg-opportunity-muted hover:shadow-glow-opportunity";
      default:
        return "";
    }
  };

  return (
    <Card className={`transition-all duration-300 ${getCardStyles()}`}>
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[80px] resize-none"
              placeholder="Enter your feedback..."
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                size="sm"
                variant="default"
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button
                onClick={handleCancel}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{text}</p>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                variant="ghost"
                className="flex-1 h-8"
              >
                <Edit2 className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button
                onClick={() => onDelete(id)}
                size="sm"
                variant="ghost"
                className="flex-1 h-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};