-- Function to delete a game by ID
create or replace function delete_game(game_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  delete from games where id = game_id;
end;
$$;

-- Function to update a game by ID
create or replace function update_game(
  game_id uuid,
  game_updates jsonb
)
returns void
language plpgsql
security definer
as $$
begin
  update games
  set
    date = COALESCE((game_updates->>'date')::date, date),
    winner = COALESCE((game_updates->>'winner')::text, winner),
    went_first = COALESCE((game_updates->>'went_first')::text, went_first),
    knock = COALESCE((game_updates->>'knock')::boolean, knock),
    score = COALESCE((game_updates->>'score')::integer, score),
    deadwood_difference = COALESCE((game_updates->>'deadwood_difference')::integer, deadwood_difference),
    undercut_by = (game_updates->>'undercut_by')::text,
    updated_at = now()
  where id = game_id;
end;
$$;