module.exports = (obj) => {
    const json = {
        blocks: [ obj.message.blocks[0] , obj.message.blocks[1],
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `:heavy_check_mark: Comment deleted by <@${obj.user.id}>`,
            }
        }
        ],
    };
    return json;
};
