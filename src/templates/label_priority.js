const moment = require('moment');

module.exports = (obj) => {
  const json = {
    blocks: [{
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Bug detected*\n`,
      },
    },
    {
      type: 'section',
      fields: [{
        type: 'mrkdwn',
        text: `*Issue:*\n*<${obj.issue.html_url}|${obj.issue.title}>*`,
      },
      {
        type: 'mrkdwn',
        text: `*User:*\n*<${obj.issue.user.html_url}|${obj.issue.user.login}>*`,
      },
      {
        type: 'mrkdwn',
        text: `*When:*\n${moment(obj.issue.created_at).format('llll')}`,
      },
      ],
    },
    {
        type: 'actions',
        elements:[
            {
                type : 'static_select',
                placeholder : {
                    type : 'plain_text',
                    text : 'Assign a priority'
                },
                action_id: JSON.stringify({
                  event: 'add_priority_to_issue',
                  owner: obj.repository.owner.login,
                  repo: obj.repository.name,
                  issue_number: obj.issue.number,
                }),
                options : [
                    {
                        text: {
                            type : "plain_text",
                            text : "High"
                        },
                        value : "high"
                    },
                    {
                        text: {
                            type : "plain_text",
                            text : "Medium"
                        },
                        value : "medium"
                    },
                    {
                        text: {
                            type : "plain_text",
                            text : "Low"
                        },
                        value : "low"
                    },
                ],
        }
    ],
},
],
};
  return json;
};
