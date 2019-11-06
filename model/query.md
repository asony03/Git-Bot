## Query to fetch the data from Google BigQuery

```
SELECT 
   url
   , repo
   , title
   , body
   , num_labels
   , labels
   , Bug_Flag as c_bug
   , Feature_Flag as c_feature
   , Question_Flag as c_question
   , Documentation_Flag as c_documentation
   , CASE
      WHEN Bug_Flag then 0
      WHEN Feature_Flag then 1
      WHEN Question_Flag then 2
      ELSE 3 
     END as class_int
FROM (
SELECT *, 
        # compute row number over title + repo such that you can arbitarily pick an issue when there is the same issue title in the same repo.
        ROW_NUMBER() OVER(PARTITION BY title, repo) as dupe_issue_title
FROM (

SELECT *, 
       # compute row number grouped by the last 75% of the issue body in order to look for near-duplicates and arbitarly pick one.
       ROW_NUMBER() OVER(PARTITION BY SUBSTR(body, Cast(length(body) * .25 as int64), length(body))) as dupe_body2
FROM (
  SELECT DISTINCT *, 
  ## Use hueristics to collapse issue labels into one of three classes: (1) Bug (2) Feature (3) Question (4) Documentation.
  ##  If an issue is not labeled with one of these, this will be filtered out of the data
  CASE when labels like '%bug%' and labels not like '%not bug%' then True else False end as Bug_Flag,
  CASE when labels like '%feature%' or labels like '%enhancement%' or labels like '%improvement%' or labels like '%request%' then True else False end as Feature_Flag,
  CASE when labels like '%question%' or labels like '%discussion%' then True else False end as Question_Flag,
  CASE when labels like '%documentation' then True else False end as Documentation_Flag,
  # capture the first 75% of the issue body in order to look for near-duplicates
  ROW_NUMBER() OVER(PARTITION BY SUBSTR(body, 0, Cast(length(body) * .75 as int64))) as dupe_body1
 
FROM(

SELECT 
  url
  ,REGEXP_EXTRACT(url, r'https://github.com/(.*)/issues') as repo
  ,max(title) as title
  ,max(body) as body
  ,max(len_labels) as num_labels
  # collapse the array of labels and convert to a string
  ,FORMAT("%T", ARRAY_CONCAT_AGG(labels)) as labels
FROM(
  SELECT *, MAX(len_labels) OVER (PARTITION BY url) as max_len
  FROM(
    SELECT
        JSON_EXTRACT(payload, '$.issue.html_url') as url
        -- extract the title and body removing parentheses, brackets, and quotes
      , LOWER(TRIM(REGEXP_REPLACE(JSON_EXTRACT(payload, '$.issue.title'), r"\\n|\(|\)|\[|\]|#|\*|`|\"", ' '))) as title
      , LOWER(TRIM(REGEXP_REPLACE(JSON_EXTRACT(payload, '$.issue.body'), r"\\n|\(|\)|\[|\]|#|\*|`|\"", ' '))) as body
      , REGEXP_EXTRACT_ALL(JSON_EXTRACT(payload, "$.issue.labels"), ',"name\":"(.+?)","color') as labels
      , ARRAY_LENGTH(REGEXP_EXTRACT_ALL(JSON_EXTRACT(payload, "$.issue.labels"), ',"name\":"(.+?)","color')) as len_labels
    FROM `githubarchive.year.20*`
    WHERE 
    _TABLE_SUFFIX BETWEEN '17' and '19'
    and type="IssuesEvent"
  )
) WHERE len_labels = max_len
  -- the body must be at least 8 words long and the title at least 3 words long
  --  this is an arbitrary way to filter out empty or sparse issues
  and ARRAY_LENGTH(SPLIT(body, ' ')) >= 6
  and ARRAY_LENGTH(SPLIT(title, ' ')) >= 3
  -- filter out issues that have really long titles or bodies
  --    (these are outliers, and will slow tokenization down).
  and ARRAY_LENGTH(SPLIT(title, ' ')) <= 50
  and ARRAY_LENGTH(SPLIT(body, ' ')) <= 1000
  and REGEXP_CONTAINS(url, r'https://github.com/(.*)/issues')
GROUP BY url
)) 
## If the same body of an issue appears > 1 time globally, arbitrarily pick one. 
## Specifically looking at the first 75% of the characters in the issue body.
WHERE dupe_body1 = 1 and num_labels >= 1
)
## If the same body of an issue appears > 1 time globally, arbitrarily pick one. 
## Specifically looking at the last 75% of the characters in the issue body.
WHERE dupe_body2 = 1
)
WHERE 
  ## if the same issue title appears > 1 time in the same repo, arbitrarily pick one
  dupe_issue_title = 1 
  # there needs to be one of the three labels
  and (Bug_Flag or Feature_Flag or Question_Flag or Documentation_Flag)
  # exclusive-or filter only one of the labels need to exist exclusively
  and (cast(Bug_Flag as int64) + cast(Feature_Flag as int64) + cast(Question_Flag as int64) + cast(Documentation_Flag as int64)) = 1
```

## Data stored in GCP

`gs://gitbot_bucket/issues_data_*`