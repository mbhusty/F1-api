import { NextResponse } from "next/server"
import { client } from "@/app/lib/turso.js"
import { SITE_URL } from "@/lib/constants"

export async function GET(request: Request, context: any) {
  const { year } = context.params
  const limit = 30
  const sql = `SELECT Races.*, Circuits.*
  FROM Races
  JOIN Championships ON Races.Championship_ID = Championships.Championship_ID
  JOIN Circuits ON Races.Circuit = Circuits.Circuit_ID
  WHERE Championships.Year = ?
  ORDER BY Races.Round ASC
  LIMIT ?;
  `

  const data = await client.execute({
    sql: sql,
    args: [year, limit],
  })

  // Procesamos los datos
  const processedData = data.rows.map((row) => {
    const circuitData = {
      circuitId: row[10],
      circuitName: row[11],
      country: row[12],
      city: row[13],
      circuitLength: row[14] + "km",
      lapRecord: row[15],
      firstParticipationYear: row[16],
      numberOfCorners: row[17],
      fastestLapDriverId: row[18],
      fastestLapTeamId: row[19],
      fastestLapYear: row[20],
      url: row[21],
    }

    return {
      Race_ID: row[0],
      Championship_ID: row[1],
      Race_Name: row[2],
      Race_Date: row[3],
      Circuit: circuitData,
      Laps: row[5],
      Winner_ID: row[6],
      Team_Winner_ID: row[7],
      URL: row[8],
      Round: row[9],
    }
  })

  return NextResponse.json({
    api: SITE_URL,
    url: request.url,
    limit: limit,
    total: processedData.length,
    season: year,
    races: processedData,
  })
}