const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET Players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
SELECT * FROM CRICKET_TEAM;`;
  const playerArr = await db.all(getPlayersQuery);
  response.send(playerArr);
});

// ADD player API
app.post("/players/", (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `
INSERT INTO CRICKET_TEAM (player_name,jersey_number,role)
VALUES('${playerName}',${jerseyNumber},'${role}');`;

  const dbResponse = db.run(addPlayer);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

// GET playerId API
app.get("/players/:playerId/", (request, response) => {
  const playerId = request.params;
  const getPlayerId = `SELECT * FROM CRICKET_TEAM 
WHERE player_id=${playerId};`;
  const player = db.get(getPlayerId);
  response.send(player);
});

//Update or Put player API
app.put("/players/:playerId/", (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `
UPDATE
cricket_team
SET
player_name = '${playerName}',
jersey_number = ${jerseyNumber},
role = '${role}'
WHERE
player_id = ${playerId};`;

  db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//DELETE player API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM
cricket_team
WHERE
player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
