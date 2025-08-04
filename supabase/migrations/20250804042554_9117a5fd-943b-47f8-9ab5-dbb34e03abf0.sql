-- Enable real-time updates for retro_attendees table
ALTER TABLE retro_attendees REPLICA IDENTITY FULL;

-- Add the table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE retro_attendees;