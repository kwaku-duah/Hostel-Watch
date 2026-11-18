import { Env, json } from "./_lib";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    `SELECT university_id, COUNT(*) AS reports, COUNT(DISTINCT hostel_key) AS hostels,
            CAST(AVG(price_per_year) AS INTEGER) AS avg_price, MIN(price_per_year) AS min_price,
            MAX(price_per_year) AS max_price
     FROM reports WHERE hidden = 0 GROUP BY university_id ORDER BY reports DESC`,
  ).all<{ reports: number }>();
  const total = results.reduce((n, r) => n + r.reports, 0);
  return json({ total, universities: results }, 200, true);
};
