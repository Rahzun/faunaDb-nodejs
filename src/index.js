const app = require("express")();
require("dotenv").config();

const faunadb = require("faunadb");
const client = new faunadb.Client({
  secret: process.env.FAUNA_DB_SECRET,
});

const {
  Paginate,
  Get,
  Ref,
  Select,
  Match,
  Index,
  Create,
  Collection,
  Lambda,
  Var,
  Join,
  Call,
  Function: Fn,
} = faunadb.query;

app.listen(5000, () => console.log("API on http://localhost:5000"));

app.get("/tweet/:id", async (req, res) => {
  const doc = await client.query(
    // Get returns first match
    Get(Ref(Collection("tweets"), req.params.id))

    // .catch((e) => res.send(e))
  );
  res.send(doc);
});

app.post("/tweet", async (req, res) => {
  const data = {
    user: Call(Fn("getUser"), "Rahzun"),
    text: "Namaskaar!",
  };

  const doc = await client.query(Create(Collection("tweets"), { data }));

  res.send(doc);
});

app.get("/tweet", async (req, res) => {
  const docs = await client.query(
    /// Paginate returns set of documents that match the query unlike only first match in `GET`
    Paginate(
      Match(
        Index("tweets_by_user"),

        /// This Select is causing CODE DUPLICATION everywhere so, Create Function in FaunaDB
        // Select('ref', Get(Match(Index('users_by_name'), 'Rahzun')))

        Call(Fn("getUser"), "Rahzun")
      )
    )
  );

  res.send(doc);
});

app.post("/relationship", async (req, res) => {
  const data = {
    followee: Call(Fn("getUser"), "Rahzun"),
    follower: Call(Fn("getUser"), "Trump"),
  };
  const doc = await client.query(Create(Collection("relationships"), { data }));

  res.send(doc);
});

app.get("/feed", async (req, res) => {
  const docs = await client.query(
    /// returns all the tweets of the user followed by Trump
    /// own FaunaDB Cloud Function can also be created to sort the results with custom logic, etc.
    Paginate(
      Join(
        Match(Index("followees_by_follower"), Call(Fn("getUser"), "Trump")),
        Index("tweets_by_user")
      )
    )
  );

  res.send(docs);
});
