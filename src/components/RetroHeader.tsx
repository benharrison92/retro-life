import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Tag, User, Filter } from "lucide-react";
import { NotificationHub } from "./NotificationHub";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from 'react-router-dom';

interface RetroHeaderProps {
  onSearchKeywords?: (keywords: string) => void;
  onFilterTags?: (tags: string) => void;
  onSearchUser?: (user: string) => void;
  onLocationSearch?: (location: string) => void;
  onFilterRBTType?: (type: string) => void;
  onFilterEventType?: (type: string) => void;
}

export const RetroHeader = ({ 
  onSearchKeywords, 
  onFilterTags, 
  onSearchUser, 
  onLocationSearch,
  onFilterRBTType,
  onFilterEventType
}: RetroHeaderProps) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchKeywords, setSearchKeywords] = useState('');
  const [filterTags, setFilterTags] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [rbtTypeFilter, setRbtTypeFilter] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  
  const currentUserName = profile?.display_name || 'You';

  const handleCreateNew = () => {
    navigate('/create-retro');
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
          <div className="flex items-center gap-4">
            <NotificationHub className="w-full sm:w-auto" />
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select value={rbtTypeFilter} onValueChange={(value) => {
              setRbtTypeFilter(value);
              onFilterRBTType?.(value);
            }}>
              <SelectTrigger className="h-10">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Type (Rose/Bud/Thorn)" />
                </div>
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover">
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="roses">🌹 Roses</SelectItem>
                <SelectItem value="buds">🌱 Buds</SelectItem>
                <SelectItem value="thorns">🌵 Thorns</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={eventTypeFilter} onValueChange={(value) => {
              setEventTypeFilter(value);
              onFilterEventType?.(value);
            }}>
              <SelectTrigger className="h-10">
                <div className="flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Event Type" />
                </div>
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover">
                <SelectItem value="">All Events</SelectItem>
                <SelectItem value="accommodation">🏨 Accommodation</SelectItem>
                <SelectItem value="food">🍽️ Food</SelectItem>
                <SelectItem value="activity">🎯 Activity</SelectItem>
                <SelectItem value="transportation">🚗 Transportation</SelectItem>
                <SelectItem value="shopping">🛍️ Shopping</SelectItem>
                <SelectItem value="entertainment">🎭 Entertainment</SelectItem>
                <SelectItem value="other">📝 Other</SelectItem>
              </SelectContent>
            </Select>
            
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
        </div>
      </CardContent>
    </Card>
  );
};