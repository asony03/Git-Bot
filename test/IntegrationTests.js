const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
require('dotenv').config();

chai.use(chaiAsPromised);
process.on('unhandledRejection', () => {});


var webdriver = require('selenium-webdriver');
var browser;

var githubLoginLink = "https://github.com/login";
var userName = process.env.GITHUB_USER_NAME;
console.log(userName);
var password = process.env.GITHUB_PASSWORD;
var repository = "GitBot-Test";
var issueName = "GitBot-Test-Issue" + Date.now();
var issueComment = "GitBot-Test-Comment"+ Date.now();

var slackLoginLink = "https://slack.com/signin";
var slackworkspace = process.env.SLACK_WORKSPACE;
var slackUserName = process.env.SLACK_USER_NAME;
var slackPassword = process.env.SLACK_PASSWORD;
var slackChannel = process.env.SLACK_CHANNEL;

var gitBranchName = "GitBot-Test-Branch"+ Date.now();
var gitFileName = "GitBot-Test-File"+ Date.now();
var gitFileComment = "GitBot-Test-File-Comment"+ Date.now();
var gitPullRequestName = "GitBot-Test-Pull-Request"+ Date.now();
var gitPullRequestComment = "GitBot-Test-Pull-Request-Comment"+ Date.now();


var chromeCapabilities = webdriver.Capabilities.chrome();
var chromeOptions = {
    'args': ['--no-sandbox',"--start-maximized"]
};
chromeCapabilities.set('chromeOptions', chromeOptions);

(async function test() {
    try {
        describe ('Git bot automated tests', async function () {
            this.timeout(50000);

            beforeEach (async () => {
                browser = new webdriver.Builder().usingServer().withCapabilities(chromeCapabilities).build();
                await browser.get(githubLoginLink);
                //await browser.manage().timeouts().implicitlyWait(1, TimeUnit.SECONDS );
                await browser.findElement(webdriver.By.id("login_field")).sendKeys(userName);
                await browser.findElement(webdriver.By.id("password")).sendKeys(password);
                await browser.findElement(webdriver.By.xpath("//input[@name='commit']")).click();  
            });

            afterEach (async () => {
                await browser.quit();
            });

            it ('find the rpository, create an issue and validate label', async () => {
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.xpath("(//div[@role='search' and @aria-label='Repositories' ]/input)[1]")).sendKeys(repository);
                await browser.sleep(1000);  
                await browser.findElement(webdriver.By.xpath("(//div[@class='js-repos-container']//li[contains(.,'"+repository+"')]//a)[1]")).click();
                await browser.sleep(1000); 
                await browser.findElement(webdriver.By.xpath("(//a//span[contains(., 'Issues')]//parent::a)")).click(); 
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.xpath("//a[@role='button' and contains(., 'New issue')]")).click();
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.id("issue_title")).sendKeys(issueName);
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.xpath("(//button[@type='submit' and contains(., 'Submit new issue')])[1]")).click();
                await browser.sleep(2000);
                // await browser.findElement(webdriver.By.xpath("(//a//span[contains(., 'Issues')]//parent::a)")).click();
                // await browser.findElement(webdriver.By.xpath("//div[@aria-label='Issues']//a[contains(., '"+issueName+"')]")).click();
                await browser.navigate().refresh();
                await browser.sleep(1000);
                var labels = await browser.findElement(webdriver.By.xpath("//details[@id='labels-select-menu']/parent::div/div")).getText();
                expect(labels).to.not.include('None yet');
            });

            it ('find the rpository, Comment on an issue and validate slack integration', async () => {
                //issueName = 'GitBot-Test-Issue1571727951325';
                //comment on the issue created in first test
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.xpath("(//div[@role='search' and @aria-label='Repositories' ]/input)[1]")).sendKeys(repository);
                await browser.sleep(1000);  
                await browser.findElement(webdriver.By.xpath("(//div[@class='js-repos-container']//li[contains(.,'"+repository+"')]//a)[1]")).click();
                await browser.sleep(1000); 
                await browser.findElement(webdriver.By.xpath("(//a//span[contains(., 'Issues')]//parent::a)")).click(); 
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.xpath("//div[@aria-label='Issues']//a[contains(., '"+issueName+"')]")).click();
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.id("new_comment_field")).sendKeys(issueComment);
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.xpath("//button[@type='submit' and contains(.,'Comment')]")).click(); 
                
                //slack integration
                await browser.get(slackLoginLink);
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.id("domain")).sendKeys(slackworkspace);
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.id("submit_team_domain")).click();
                await browser.sleep(2000);
                await browser.findElement(webdriver.By.id("email")).sendKeys(slackUserName);
                await browser.sleep(2000);
                await browser.findElement(webdriver.By.id("password")).sendKeys(slackPassword);
                await browser.sleep(2000);
                await browser.findElement(webdriver.By.id("signin_btn")).click();
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.xpath("(//div[contains(@class, 'channel_sidebar')])[1]//a[contains(., '"+slackChannel+"')]")).click();
                await browser.sleep(2000);
                var elemeents = await browser.findElements(webdriver.By.xpath("//a[contains(., 'Test-comment')]"))
                expect(elemeents.length).to.be.gt(0);
            });

            it ('find the repository, create a branch , add a file and create pull request. Validate pull request labels', async () => {
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.xpath("(//div[@role='search' and @aria-label='Repositories']/input)[1]")).sendKeys(repository);
                await browser.sleep(1000);  
                await browser.findElement(webdriver.By.xpath("(//div[@class='js-repos-container']//li[contains(.,'"+repository+"')]//a)[1]")).click();
                await browser.sleep(1000); 
                await browser.findElement(webdriver.By.id("branch-select-menu")).click();
                await browser.sleep(2000);
                await browser.findElement(webdriver.By.id("context-commitish-filter-field")).sendKeys(gitBranchName);
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.xpath("//button[@type='submit' and contains(.,'Create branch:')]")).click();
                // await browser.findElement(webdriver.By.id("context-commitish-filter-field")).sendKeys(webdriver.Key.ENTER);
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.xpath("//button[@type='submit' and contains(.,'Create new file')]")).click();
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.xpath("//input[@name='filename']")).sendKeys(gitFileName);
                await browser.findElement(webdriver.By.id("commit-summary-input")).sendKeys(gitFileComment);
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.id("submit-file")).click();
                await browser.sleep(2000);
                await browser.findElement(webdriver.By.xpath("//a[contains(@class,'new-pull-request-btn')]")).click();
                await browser.sleep(2000);
                //await browser.findElement(webdriver.By.id("pull_request_title")).sendKeys(gitPullRequestName);
                await browser.sleep(1000);
                await browser.findElement(webdriver.By.xpath("//button[@type='submit' and contains(.,'Create pull request')]")).click();
                await browser.sleep(5000);
                await browser.navigate().refresh();
                await browser.sleep(1000);
                var labels = await browser.findElement(webdriver.By.xpath("//details[@id='labels-select-menu']/parent::div/div")).getText();
                expect(labels).to.not.include('None yet');
            });

            it ('find the repository, open the created branch, comment on the pull request and Validate the cooment is classified and posted on slack', async () => {
                
                //gitPullRequestName = 'GitBot-Test-Pull-Request1571762134012';
                await browser.sleep(1000); 
                await browser.findElement(webdriver.By.xpath("(//div[@role='search' and @aria-label='Repositories']/input)[1]")).sendKeys(repository);
                await browser.sleep(1000);  
                await browser.findElement(webdriver.By.xpath("(//div[@class='js-repos-container']//li[contains(.,'"+repository+"')]//a)[1]")).click();
                await browser.sleep(1000); 
                await browser.findElement(webdriver.By.xpath("(//a//span[contains(., 'Pull requests')]//parent::a)")).click();
                await browser.sleep(1000); 
                await browser.findElement(webdriver.By.xpath("//div[@aria-label='Issues']//a[contains(., '"+gitPullRequestName+"')]")).click();
                await browser.sleep(1000); 
                await browser.findElement(webdriver.By.id("new_comment_field")).sendKeys(gitPullRequestComment);
                await browser.sleep(1000); 
                await browser.findElement(webdriver.By.xpath("//button[@type='submit' and contains(.,'Comment')]")).click(); 
                await browser.sleep(1000); 

                await browser.get(slackLoginLink);
                await browser.findElement(webdriver.By.id("domain")).sendKeys(slackworkspace);
                await browser.findElement(webdriver.By.id("submit_team_domain")).click();
                await browser.sleep(2000);
                await browser.findElement(webdriver.By.id("email")).sendKeys(slackUserName);
                await browser.sleep(2000);
                await browser.findElement(webdriver.By.id("password")).sendKeys(slackPassword);
                await browser.sleep(2000);
                await browser.findElement(webdriver.By.id("signin_btn")).click();
                await browser.findElement(webdriver.By.xpath("(//div[contains(@class, 'channel_sidebar')])[1]//a[contains(., '"+slackChannel+"')]")).click();
                await browser.sleep(2000);
                var elemeents = await browser.findElements(webdriver.By.xpath("//a[contains(., 'Test-comment')]"))
                expect(elemeents.length).to.be.gt(0);
            });
        });
    } catch (ex) {
        console.log (new Error(ex.message));
    } finally {

    }
})();