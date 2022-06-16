import { Suspense, useState, useEffect } from "react"
import { Head, Link, usePaginatedQuery, useRouter, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getQuestions from "app/questions/queries/getQuestions"

const ITEMS_PER_PAGE = 100

export const QuestionsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ questions, hasMore }] = usePaginatedQuery(getQuestions, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const [filter, setFilter] = useState("")
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  let filteredQuestions = questions.filter((question) => question.text.includes(filter))
  let totalVotes = filteredQuestions.map((question) => {
    return question.choices.length > 0
      ? question.choices.map((choice) => choice.votes).reduce((a, b) => a + b)
      : 0
  })
  console.log(totalVotes)

  return (
    <div>
      <input
        type="text"
        placeholder="filter out questions"
        className="questionFilter"
        onChange={(e) => {
          setFilter(e.target.value)
        }}
      />
      <ul className="questionsList">
        {filteredQuestions.map((question, index) => (
          <Link href={Routes.ShowQuestionPage({ questionId: question.id })} key={index}>
            <li className="question">
              <h2>{question.text}</h2>
              <ul>
                {question.choices.map((choice) => (
                  <li key={choice.id}>
                    {choice.text}- {choice.votes}
                    <div
                      className="votesBar"
                      //@ts-ignore
                      style={{ width: `${(choice.votes * 100) / totalVotes[index]}%` }}
                    />
                  </li>
                ))}
              </ul>
              <h5>Total Votes: {totalVotes[index]}</h5>
            </li>
          </Link>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const QuestionsPage: BlitzPage = () => {
  return (
    <div className="container">
      <Head>
        <title>Questions</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewQuestionPage()}>
            <a>
              <h1>Create Question</h1>
            </a>
          </Link>
        </p>
        <Suspense fallback={<div>Loading...</div>}>
          <QuestionsList />
        </Suspense>
      </div>
      <style jsx global>{`
        .container {
          display: flex;
          justify-content: center;
          height: 100vh;
        }

        .questionsList {
          list-style: none;
          display: flex;
          justify-content: flex-start;
          gap: 15px;
          padding: 0;
          width: 80vw;
          flex-wrap: wrap;
        }

        .question {
          border: 1px solid black;
          min-height: 150px;
          min-width: 150px;
          border-radius: 10px;
          padding: 10px;
          text-decoration: none;
          cursor: pointer;
          color: black;
          transition: 0.5s;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .question:hover {
          transform: scale(1.04);
          background-color: rgba(23, 43, 56, 0.2);
        }

        .questionFilter {
          height: 25px;
          width: 300px;
          border-radius: 10px;
          text-indent: 10px;
          border: 2px solid black;
        }

        .votesBar {
          height: 10px;
          background-color: black;
          width: 20px;
        }
      `}</style>
    </div>
  )
}

QuestionsPage.authenticate = true
QuestionsPage.getLayout = (page) => <Layout>{page}</Layout>

export default QuestionsPage
