import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Tag, User } from "lucide-react";
import { NotificationHub } from "./NotificationHub";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from 'react-router-dom';

interface RetroHeaderProps {
  onSearchKeywords?: (keywords: string) => void;
  onFilterTags?: (tags: string) => void;
  onSearchUser?: (user: string) => void;
  onLocationSearch?: (location: string) => void;
}

export const RetroHeader = ({ 
  onSearchKeywords, 
  onFilterTags, 
  onSearchUser, 
  onLocationSearch 
}: RetroHeaderProps) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchKeywords, setSearchKeywords] = useState('');
  const [filterTags, setFilterTags] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  
  const currentUserName = profile?.display_name || 'You';

  const handleCreateNew = () => {
    navigate('/create-retro');
  };

  const handleQuickRBT = () => {
    // TODO: Implement Quick RBT functionality
    console.log('Quick RBT clicked');
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">
              Retro App
            </CardTitle>
            <p className="text-lg opacity-90">Reflect, Learn, Optimize Your Experiences</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center text-sm text-muted-foreground mb-6 p-3 bg-muted/50 rounded-lg">
          Current User: <span className="font-semibold text-foreground">{currentUserName}</span>
        </div>
      
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <Button
            onClick={handleCreateNew}
            className="w-full sm:w-auto px-6 py-3 text-lg font-bold"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Experience
          </Button>
          <Button
            variant="outline"
            onClick={handleQuickRBT}
            className="w-full sm:w-auto px-6 py-3"
            size="lg"
          >
            Quick RBT
          </Button>

          <div className="flex items-center gap-4">
            <NotificationHub className="w-full sm:w-auto" />
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search keywords..."
              className="pl-10"
              value={searchKeywords}
              onChange={(e) => {
                setSearchKeywords(e.target.value);
                onSearchKeywords?.(e.target.value);
              }}
            />
          </div>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Filter by tags..."
              className="pl-10"
              value={filterTags}
              onChange={(e) => {
                setFilterTags(e.target.value);
                onFilterTags?.(e.target.value);
              }}
            />
          </div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchUser}
              onChange={(e) => {
                setSearchUser(e.target.value);
                onSearchUser?.(e.target.value);
              }}
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="City, State..."
              className="pl-10"
              value={locationSearch}
              onChange={(e) => {
                setLocationSearch(e.target.value);
                onLocationSearch?.(e.target.value);
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};