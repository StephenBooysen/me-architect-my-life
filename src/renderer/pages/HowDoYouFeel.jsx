import React, { useState, useEffect } from 'react';
import { useDatabase } from '../contexts/UnifiedDatabaseContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isFuture, isToday, isBefore } from 'date-fns';
import { ChevronLeft, ChevronRight, Smile, Frown, Meh, Laugh, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const moodOptions = [
  { rating: 1, label: 'Crap', icon: <Frown className="w-8 h-8 text-red-500" /> },
  { rating: 2, label: 'Not cool', icon: <Meh className="w-8 h-8 text-yellow-500" /> },
  { rating: 3, label: 'Cool', icon: <Smile className="w-8 h-8 text-blue-500" /> },
  { rating: 4, label: 'Awesome', icon: <Laugh className="w-8 h-8 text-green-500" /> },
  { rating: 5, label: 'Astronomical', icon: <Star className="w-8 h-8 text-purple-500" /> },
];

function HowDoYouFeel() {
  const db = useDatabase();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [moods, setMoods] = useState({});

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

  useEffect(() => {
    loadMoods();
  }, [currentDate]);

  const loadMoods = async () => {
    const monthStr = format(currentDate, 'yyyy-MM');
    const result = await db.getMoodsForMonth(monthStr);
    const moodsMap = {};
    result.forEach(mood => {
      moodsMap[mood.date] = mood.rating;
    });
    setMoods(moodsMap);
  };

  const handleSetMood = async (day, rating) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    if (isFuture(day) || isBefore(day, new Date()) && !isToday(day)) {
      return;
    }
    await db.setMood(dateStr, rating);
    loadMoods();
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <CardTitle className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth} disabled={isFuture(addMonths(currentDate, 1))}>
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-muted-foreground">{day}</div>
            ))}
            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const moodRating = moods[dateStr];
              const mood = moodOptions.find(m => m.rating === moodRating);
              const isDisabled = isFuture(day) || (isBefore(day, new Date()) && !isToday(day));

              return (
                <div key={day.toString()} className={`p-4 border rounded-lg flex flex-col items-center justify-center space-y-2 ${isDisabled ? 'bg-muted/50' : ''}`}>
                  <div className="text-lg font-semibold">{format(day, 'd')}</div>
                  <div className="flex flex-col space-y-2">
                    {moodOptions.map(option => (
                      <Button
                        key={option.rating}
                        variant={moodRating === option.rating ? 'outline' : 'ghost'}
                        size="icon"
                        onClick={() => handleSetMood(day, option.rating)}
                        disabled={isDisabled}
                        className={moodRating === option.rating ? 'bg-gray-200' : ''}
                      >
                        {option.icon}
                      </Button>
                    ))}
                  </div>
                  {mood && <div className="text-sm text-muted-foreground">{mood.label}</div>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HowDoYouFeel;
