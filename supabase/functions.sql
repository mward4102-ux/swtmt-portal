-- Run this after schema.sql. Creates the atomic increment RPC used by llm.ts.

create or replace function increment_llm_usage(
  p_month text,
  p_model text,
  p_in int,
  p_out int,
  p_cost numeric
) returns void language plpgsql as $$
begin
  insert into llm_usage (month, model, tokens_in, tokens_out, cost_usd)
  values (p_month, p_model, p_in, p_out, p_cost)
  on conflict (month, model) do update
    set tokens_in  = llm_usage.tokens_in  + excluded.tokens_in,
        tokens_out = llm_usage.tokens_out + excluded.tokens_out,
        cost_usd   = llm_usage.cost_usd   + excluded.cost_usd,
        updated_at = now();
end;
$$;
