import { NextResponse } from "next/server"
import { client } from "@/app/lib/turso.js"
import { SITE_NAME } from "@/lib/constants"

export async function GET(request: Request, context: any) {
  const { year } = context.params
  const limit = 30
  const sql = `SELECT Driver_Classifications.*, Drivers.*, Teams.*
  FROM Driver_Classifications
  JOIN Championships ON Driver_Classifications.Championship_ID = Championships.Championship_ID
  JOIN Drivers ON Driver_Classifications.Driver_ID = Drivers.Driver_ID
  JOIN Teams ON Driver_Classifications.Team_ID = Teams.Team_ID
  WHERE Championships.Year = ?
  ORDER BY Driver_Classifications.Points DESC, Driver_Classifications.Position ASC
  LIMIT ?;
  `

  const data = await client.execute({
    sql: sql,
    args: [year, limit],
  })

  console.log(data)

  // Procesamos los datos
  const processedData = data.rows.map((row) => {
    return {
      Classification_ID: row[0],
      Championship_ID: row[1],
      Driver_ID: row[2],
      Team_ID: row[3],
      Points: row[4],
      Position: row[5],
      Driver: {
        // Aquí obtienes la información del piloto
        driverId: row[3],
        name: row[7],
        surname: row[8],
        nationality: row[9],
        birthday: row[10],
        number: row[11],
        short_name: row[12],
        url: row[13],
      },
      Team: {
        // Aquí obtienes la información del equipo
        teamId: row[14],
        name: row[15],
        nationality: row[16],
        firstAppareance: row[17],
        constructorsChampionships: row[18],
        driversChampionships: row[19],
        url: row[20],
      },
    }
  })

  return NextResponse.json({
    api: SITE_NAME,
    url: request.url,
    limit: limit,
    total: processedData.length,
    season: year,
    drivers_championship: processedData,
  })
}