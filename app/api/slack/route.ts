import * as prismicClient from '@prismicio/client'

export async function POST(request: Request) {
    try {
        const slackUrl = process.env.SLACK_WEBHOOK_URL ? process.env.SLACK_WEBHOOK_URL : ""
        const body = await request.json()

        const impactedDocs = body.documents
        const client = prismicClient.createClient("slice-deck")
        const publishedDocs = await client.getByIDs(impactedDocs)
        const publishedDocsIds = publishedDocs.results.map(doc => doc.id)
        const publishedDocsText = publishedDocsIds.length>0 ? "published decks : " + JSON.stringify(publishedDocsIds) + ", take a look here: https://slice-deck.prismic.io/builder/pages/" + publishedDocsIds[0]+ "?s=published\n" : ""
        const unpublishedDocsIds = impactedDocs.filter((doc: string) => !publishedDocsIds.includes(doc))
        const unpublishedDocsText = unpublishedDocsIds.length>0 ? "unpublished decks : " + JSON.stringify(unpublishedDocsIds) + ", take a look here: https://slice-deck.prismic.io/builder/pages/" + unpublishedDocsIds[0]+ "?s=archived\n" : ""

        const superText = {
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": ":mega: *Document Updates* :mega:"
                }
              },
              {
                "type": "divider"
              },
              {
                "type": "section",
                "fields": [
                  {
                    "type": "mrkdwn",
                    "text": "*Published Document:*"
                  },
                  {
                    "type": "mrkdwn",
                    "text": "*Unpublished Document:*"
                  }
                ]
              },
              {
                "type": "section",
                "fields": [
                  {
                    "type": "mrkdwn",
                    "text": ":white_check_mark: " + publishedDocsText
                  },
                  {
                    "type": "mrkdwn",
                    "text": ":x: " + unpublishedDocsText
                  }
                ]
              },
              {
                "type": "divider"
              },
              {
                "type": "context",
                "elements": [
                  {
                    "type": "mrkdwn",
                    "text": "For more details, please check the document management system."
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