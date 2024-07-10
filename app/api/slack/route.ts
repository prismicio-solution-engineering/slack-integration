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
    const publishedDocsText = publishedDocsIds.length > 0 ? ":white_check_mark: Published deck :\n" + publishedDocsResults.map(doc => "- <https://slice-deck.prismic.io/builder/pages/" + doc.id + "?s=published|" + prismicClient.asText(doc.data.title) + ">\n") : undefined
    const unpublishedDocsIds = impactedDocs.filter((doc: string) => !publishedDocsIds.includes(doc))
    const unpublishedDocsText = unpublishedDocsIds.length > 0 ? ":x: Unpublished deck :\n" + unpublishedDocsIds.map((id: string)  => "- <https://slice-deck.prismic.io/builder/pages/" + id + "?s=archived|" + id + ">\n") : undefined
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
    ].filter(Boolean)

    console.log(fields)

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