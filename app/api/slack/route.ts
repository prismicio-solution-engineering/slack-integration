import * as prismicClient from '@prismicio/client'

export async function POST(request: Request) {
  try {
    const slackUrl = process.env.SLACK_WEBHOOK_URL ? process.env.SLACK_WEBHOOK_URL : ""
    const body = await request.json()

    const impactedDocs = body.documents
    const client = prismicClient.createClient("slice-deck")
    const publishedDocs = await client.getByIDs(impactedDocs)
    const publishedDocsResults = publishedDocs.results
    const publishedDocsIds = publishedDocs.results.map(doc => doc.id)
    const publishedDocsText = publishedDocsIds.length > 0 ? ":white_check_mark: published decks :\n" + publishedDocsResults.map(doc => JSON.stringify(doc.data.title + ", take a look here: https://slice-deck.prismic.io/builder/pages/" + doc.id )+ "?s=published\n").join('') : ""
    const unpublishedDocsIds = impactedDocs.filter((doc: string) => !publishedDocsIds.includes(doc))
    const unpublishedDocsText = unpublishedDocsIds.length > 0 ? ":x: unpublished decks :\n" + unpublishedDocsIds.map((id: string) => JSON.stringify(id) + ", take a look here: https://slice-deck.prismic.io/builder/pages/" + id + "?s=archived\n").join('') : ""
    const fields = [
      publishedDocsText &&
      {
        "type": "mrkdwn",
        "text": publishedDocsText
      },
      unpublishedDocsText &&
      {
        "type": "mrkdwn",
        "text": unpublishedDocsText
      }
    ]

    const superText = {
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": ":cool-dog: *Document Updates* :cool-dog:"
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "fields": fields
        },
        // {
        //   "type": "section",
        //   "fields": [
        //     {
        //       "type": "mrkdwn",
        //       "text": publishedDocsText
        //     },
        //     {
        //       "type": "mrkdwn",
        //       "text": unpublishedDocsText
        //     }
        //   ]
        // },
        {
          "type": "divider"
        },
        {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text": "For more details, please check the document management system: https://slice-deck.prismic.io."
            }
          ]
        }
      ]
    }

    const res = await fetch(slackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(superText
      ),
    })
    const status = res.status
    console?.log(status)
    if (status === 200) {
      return Response.json({ "status": "ok" })
    }
  } catch (error) {
    console.log(error)
  }
  return Response.json({})
}