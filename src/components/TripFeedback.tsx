import { useState } from "react";
import { ThumbsUp, ThumbsDown, Lightbulb } from "lucide-react";
import { FeedbackColumn } from "./FeedbackColumn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface FeedbackItem {
  id: string;
  text: string;
  type: "positive" | "negative" | "opportunity";
}

export const TripFeedback = () => {
  const [tripName, setTripName] = useState("");
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const { toast } = useToast();

  const addItem = (text: string, type: "positive" | "negative" | "opportunity") => {
    const newItem: FeedbackItem = {
      id: Date.now().toString(),
      text,
      type,
    };
    setFeedbackItems([...feedbackItems, newItem]);
    toast({
      title: "Feedback added!",
      description: `Your ${type} feedback has been saved.`,
    });
  };

  const editItem = (id: string, newText: string) => {
    setFeedbackItems(
      feedbackItems.map((item) =>
        item.id === id ? { ...item, text: newText } : item
      )
    );
    toast({
      title: "Feedback updated!",
      description: "Your feedback has been successfully updated.",
    });
  };

  const deleteItem = (id: string) => {
    setFeedbackItems(feedbackItems.filter((item) => item.id !== id));
    toast({
      title: "Feedback deleted",
      description: "Your feedback has been removed.",
      variant: "destructive",
    });
  };

  const clearAll = () => {
    setFeedbackItems([]);
    setTripName("");
    toast({
      title: "All feedback cleared",
      description: "Your feedback board has been reset.",
    });
  };

  const positiveItems = feedbackItems.filter((item) => item.type === "positive");
  const negativeItems = feedbackItems.filter((item) => item.type === "negative");
  const opportunityItems = feedbackItems.filter((item) => item.type === "opportunity");

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-elegant">
          <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="text-2xl md:text-3xl font-bold text-center">
              Trip Feedback Board
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="trip-name" className="block text-sm font-medium mb-2">
                  Trip or Event Name
                </label>
                <Input
                  id="trip-name"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="Enter your trip or event name..."
                  className="text-lg"
                />
              </div>
              {feedbackItems.length > 0 && (
                <Button onClick={clearAll} variant="outline">
                  Clear All
                </Button>
              )}
            </div>
            {tripName && (
              <div className="mt-4 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  Feedback for: {tripName}
                </h2>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FeedbackColumn
            title="Positive"
            type="positive"
            items={positiveItems}
            onAddItem={addItem}
            onEditItem={editItem}
            onDeleteItem={deleteItem}
            icon={<ThumbsUp className="w-5 h-5" />}
          />
          <FeedbackColumn
            title="Negative"
            type="negative"
            items={negativeItems}
            onAddItem={addItem}
            onEditItem={editItem}
            onDeleteItem={deleteItem}
            icon={<ThumbsDown className="w-5 h-5" />}
          />
          <FeedbackColumn
            title="Opportunity"
            type="opportunity"
            items={opportunityItems}
            onAddItem={addItem}
            onEditItem={editItem}
            onDeleteItem={deleteItem}
            icon={<Lightbulb className="w-5 h-5" />}
          />
        </div>

        {/* Summary */}
        {feedbackItems.length > 0 && (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-positive-muted">
                  <div className="text-2xl font-bold text-positive">
                    {positiveItems.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Positive</div>
                </div>
                <div className="p-4 rounded-lg bg-negative-muted">
                  <div className="text-2xl font-bold text-negative">
                    {negativeItems.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Negative</div>
                </div>
                <div className="p-4 rounded-lg bg-opportunity-muted">
                  <div className="text-2xl font-bold text-opportunity">
                    {opportunityItems.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Opportunities</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};