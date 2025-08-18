import React, { useState, useEffect, useCallback } from "react";
import { useDatabase } from "../contexts/UnifiedDatabaseContext";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks } from "date-fns";

function Habits() {
  const { getHabits, createHabit, getHabitLogs, logHabit } = useDatabase();
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [habitLogs, setHabitLogs] = useState({});
  const [lastWeekLogs, setLastWeekLogs] = useState({});

  const today = new Date();
  const weekStartsOn = 1; // Monday
  const currentWeek = eachDayOfInterval({
    start: startOfWeek(today, { weekStartsOn }),
    end: endOfWeek(today, { weekStartsOn }),
  });
  const lastWeek = eachDayOfInterval({
    start: startOfWeek(subWeeks(today, 1), { weekStartsOn }),
    end: endOfWeek(subWeeks(today, 1), { weekStartsOn }),
  });

  const fetchHabitsAndLogs = useCallback(async () => {
    const activeHabits = await getHabits();
    setHabits(activeHabits);

    const logs = {};
    const lastWeekLogsData = {};

    for (const habit of activeHabits) {
      const currentWeekLogs = await getHabitLogs(
        habit.id,
        format(currentWeek[0], "yyyy-MM-dd"),
        format(currentWeek[6], "yyyy-MM-dd")
      );
      logs[habit.id] = currentWeekLogs.reduce((acc, log) => {
        acc[log.date] = log.completed;
        return acc;
      }, {});

      const lastWeekLogsResult = await getHabitLogs(
        habit.id,
        format(lastWeek[0], "yyyy-MM-dd"),
        format(lastWeek[6], "yyyy-MM-dd")
      );
      lastWeekLogsData[habit.id] = lastWeekLogsResult.reduce((acc, log) => {
        acc[log.date] = log.completed;
        return acc;
      }, {});
    }
    setHabitLogs(logs);
    setLastWeekLogs(lastWeekLogsData);
  }, [getHabits, getHabitLogs, currentWeek, lastWeek]);

  useEffect(() => {
    fetchHabitsAndLogs();
  }, [fetchHabitsAndLogs]);

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      await createHabit({ name: newHabitName });
      setNewHabitName("");
      fetchHabitsAndLogs();
    }
  };

  const handleLogHabit = async (habitId, date, completed) => {
    await logHabit(habitId, format(date, "yyyy-MM-dd"), completed);
    fetchHabitsAndLogs();
  };

  const getHabitSuccessRate = (habitId) => {
    const logs = lastWeekLogs[habitId] || {};
    const completedCount = Object.values(logs).filter(Boolean).length;
    return completedCount;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Habits</h1>
        <p className="text-gray-600">Build and track daily habits</p>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-4">Add New Habit</h2>
          <form onSubmit={handleAddHabit} className="flex gap-2">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Enter a new habit..."
              className="input input-bordered w-full"
            />
            <button type="submit" className="btn btn-primary">
              Add Habit
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-4">This Week's Habits</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Habit</th>
                  {currentWeek.map((day) => (
                    <th key={day} className="text-center">
                      {format(day, "EEE")}
                      <br />
                      {format(day, "d")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {habits.map((habit) => (
                  <tr key={habit.id}>
                    <td>{habit.name}</td>
                    {currentWeek.map((day) => (
                      <td key={day} className="text-center">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={
                            habitLogs[habit.id]?.[format(day, "yyyy-MM-dd")] ||
                            false
                          }
                          onChange={(e) =>
                            handleLogHabit(habit.id, day, e.target.checked)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-4">Last Week's Summary</h2>
          <ul className="space-y-2">
            {habits.map((habit) => (
              <li
                key={habit.id}
                className="flex justify-between items-center p-2 rounded-lg"
              >
                <span>{habit.name}</span>
                <span className="font-semibold">
                  {getHabitSuccessRate(habit.id)} / 7
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Habits;