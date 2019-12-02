const chai = require('chai');

const { expect } = chai;
const chaiAsPromised = require('chai-as-promised');
require('dotenv').config();

chai.use(chaiAsPromised);
process.on('unhandledRejection', () => {});

const webdriver = require('selenium-webdriver');

let browser;

const githubLoginLink = 'https://github.com/login';
const userName = process.env.GITHUB_USER_NAME;
const password = process.env.GITHUB_PASSWORD;
const repository = 'GitBot-Test';
const issueName = 'Damn It Issue ' + Date.now();
const issueComment = 'Damn It Comment ' + Date.now();

const issueNonToxicName = 'GitBot-Test-Issue-Non-Toxic' + Date.now();
const issueNonToxicComment = 'GitBot-Test-Non-Toxic-Comment' + Date.now();

const slackLoginLink = 'https://slack.com/signin';
const slackworkspace = process.env.SLACK_WORKSPACE;
const slackUserName = process.env.SLACK_USER_NAME;
const slackPassword = process.env.SLACK_PASSWORD;
const slackChannel = process.env.SLACK_CHANNEL;

const gitBranchName = 'GitBot-Test-Branch' + Date.now();
const gitFileName = 'GitBot-Test-File' + Date.now();
const gitPullRequestName = 'Damn It Pull-Request' + Date.now();
const gitPullRequestComment = 'Damn It Pull-Request-Comment' + Date.now();


const chromeCapabilities = webdriver.Capabilities.chrome();
const chromeOptions = {
  args: ['--no-sandbox', '--start-maximized'],
};
chromeCapabilities.set('chromeOptions', chromeOptions);

(async function test() {
  try {
    describe('Git bot automated tests', async function () {
      this.timeout(50000);

      beforeEach(async () => {
        browser = new webdriver.Builder().usingServer().withCapabilities(chromeCapabilities).build();
        await browser.get(githubLoginLink);
        // await browser.manage().timeouts().implicitlyWait(1, TimeUnit.SECONDS );
        await browser.findElement(webdriver.By.id('login_field')).sendKeys(userName);
        await browser.findElement(webdriver.By.id('password')).sendKeys(password);
        await browser.findElement(webdriver.By.xpath("//input[@name='commit']")).click();
      });

      afterEach(async () => {
        await browser.quit();
      });

      it('find the repository, create an issue and validate label are generated', async () => {
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("(//div[@role='search' and @aria-label='Repositories' ]/input)[1]")).sendKeys(repository);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath(`(//div[@class='js-repos-container']//li[contains(.,'${repository}')]//a)[1]`)).click();
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("(//a//span[contains(., 'Issues')]//parent::a)")).click();
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("//a[@role='button' and contains(., 'New issue')]")).click();
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.id('issue_title')).sendKeys(issueName);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("(//button[@type='submit' and contains(., 'Submit new issue')])[1]")).click();
        await browser.sleep(2000);
        // await browser.findElement(webdriver.By.xpath("(//a//span[contains(., 'Issues')]//parent::a)")).click();
        // await browser.findElement(webdriver.By.xpath("//div[@aria-label='Issues']//a[contains(., '"+issueName+"')]")).click();
        await browser.navigate().refresh();
        await browser.sleep(1000);
        let labels = await browser.findElement(webdriver.By.xpath("//details[@id='labels-select-menu']/parent::div/div")).getText();
        expect(labels).to.not.include('None yet');
      });

      it('find the repository, Comment on an issue and validate the comment is posted on slack for Toxic Comment', async () => {
        // issueName = 'GitBot-Test-Issue1571727951325';
        // comment on the issue created in first test
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("(//div[@role='search' and @aria-label='Repositories' ]/input)[1]")).sendKeys(repository);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath(`(//div[@class='js-repos-container']//li[contains(.,'${repository}')]//a)[1]`)).click();
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("(//a//span[contains(., 'Issues')]//parent::a)")).click();
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath(`//div[@aria-label='Issues']//a[contains(., '${issueName}')]`)).click();
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.id('new_comment_field')).sendKeys(issueComment);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("//button[@type='submit' and contains(.,'Comment')]")).click();

        // slack integration
        await browser.get(slackLoginLink);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.id('domain')).sendKeys(slackworkspace);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.id('submit_team_domain')).click();
        await browser.sleep(2000);
        await browser.findElement(webdriver.By.id('email')).sendKeys(slackUserName);
        await browser.sleep(2000);
        await browser.findElement(webdriver.By.id('password')).sendKeys(slackPassword);
        await browser.sleep(2000);
        await browser.findElement(webdriver.By.id('signin_btn')).click();
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath(`(//div[contains(@class, 'channel_sidebar')])[1]//a[contains(., '${slackChannel}')]`)).click();
        await browser.sleep(5000);
        const elements = await browser.findElements(webdriver.By.xpath(`//a[contains(., '${issueComment}')]`));
        // expext the comment to be posted on slack.
        expect(elements.length).to.be.gt(0);
      });


      it('find the repository, Comment on an issue and validate the comment is not posted on slack for Non - Toxic Comment', async () => {
        //This test case is expected to fail as we have not implemented the ML service to get the toxicity. The mocking service will treat the comment as toxic for Integrations.
        // comment on the issue created in first test
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("(//div[@role='search' and @aria-label='Repositories' ]/input)[1]")).sendKeys(repository);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath(`(//div[@class='js-repos-container']//li[contains(.,'${repository}')]//a)[1]`)).click();
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("(//a//span[contains(., 'Issues')]//parent::a)")).click();
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath(`//div[@aria-label='Issues']//a[contains(., '${issueNonToxicName}')]`)).click();
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.id('new_comment_field')).sendKeys(issueNonToxicComment);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("//button[@type='submit' and contains(.,'Comment')]")).click();

        // slack integration
        await browser.get(slackLoginLink);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.id('domain')).sendKeys(slackworkspace);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.id('submit_team_domain')).click();
        await browser.sleep(2000);
        await browser.findElement(webdriver.By.id('email')).sendKeys(slackUserName);
        await browser.sleep(2000);
        await browser.findElement(webdriver.By.id('password')).sendKeys(slackPassword);
        await browser.sleep(2000);
        await browser.findElement(webdriver.By.id('signin_btn')).click();
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath(`(//div[contains(@class, 'channel_sidebar')])[1]//a[contains(., '${slackChannel}')]`)).click();
        await browser.sleep(5000);
        const elements = await browser.findElements(webdriver.By.xpath(`//a[contains(., '${issueNonToxicComment}')]`));
        //expect the comment is not posted on slack
        expect(elements.length).to.be.eq(0);
      });

      it('find the repository, create a branch , add a file and create pull request. Validate pull request labels are generated', async () => {
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("(//div[@role='search' and @aria-label='Repositories']/input)[1]")).sendKeys(repository);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath(`(//div[@class='js-repos-container']//li[contains(.,'${repository}')]//a)[1]`)).click();
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.id('branch-select-menu')).click();
        await browser.sleep(2000);
        await browser.findElement(webdriver.By.id('context-commitish-filter-field')).sendKeys(gitBranchName);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("//button[@type='submit' and contains(.,'Create branch:')]")).click();
        // await browser.findElement(webdriver.By.id("context-commitish-filter-field")).sendKeys(webdriver.Key.ENTER);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("//button[@type='submit' and contains(.,'Create new file')]")).click();
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("//input[@name='filename']")).sendKeys(gitFileName);
        await browser.findElement(webdriver.By.id('commit-summary-input')).sendKeys(gitPullRequestName);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.id('submit-file')).click();
        await browser.sleep(2000);
        await browser.findElement(webdriver.By.xpath("//a[contains(@class,'new-pull-request-btn')]")).click();
        await browser.sleep(2000);
        // await browser.findElement(webdriver.By.id("pull_request_title")).sendKeys(gitPullRequestName);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("//button[@type='submit' and contains(.,'Create pull request')]")).click();
        await browser.sleep(5000);
        await browser.navigate().refresh();
        await browser.sleep(1000);
        let labels = await browser.findElement(webdriver.By.xpath("//details[@id='labels-select-menu']/parent::div/div")).getText();
        expect(labels).to.not.include('None yet');
      });

      it('find the repository, open the created branch, comment on the pull request and Validate the cooment is classified and posted on slack', async () => {
        // gitPullRequestName = 'GitBot-Test-Pull-Request1571762134012';
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("(//div[@role='search' and @aria-label='Repositories']/input)[1]")).sendKeys(repository);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath(`(//div[@class='js-repos-container']//li[contains(.,'${repository}')]//a)[1]`)).click();
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("(//a//span[contains(., 'Pull requests')]//parent::a)")).click();
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath(`//div[@aria-label='Issues']//a[contains(., '${gitPullRequestName}')]`)).click();
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.id('new_comment_field')).sendKeys(gitPullRequestComment);
        await browser.sleep(1000);
        await browser.findElement(webdriver.By.xpath("//button[@type='submit' and contains(.,'Comment')]")).click();
        await browser.sleep(1000);

        await browser.get(slackLoginLink);
        await browser.findElement(webdriver.By.id('domain')).sendKeys(slackworkspace);
        await browser.findElement(webdriver.By.id('submit_team_domain')).click();
        await browser.sleep(2000);
        await browser.findElement(webdriver.By.id('email')).sendKeys(slackUserName);
        await browser.sleep(2000);
        await browser.findElement(webdriver.By.id('password')).sendKeys(slackPassword);
        await browser.sleep(2000);
        await browser.findElement(webdriver.By.id('signin_btn')).click();
        await browser.findElement(webdriver.By.xpath(`(//div[contains(@class, 'channel_sidebar')])[1]//a[contains(., '${slackChannel}')]`)).click();
        await browser.sleep(5000);
        const elements = await browser.findElements(webdriver.By.xpath(`//a[contains(., '${gitPullRequestComment}')]`));
        expect(elements.length).to.be.gt(0);
      });
    });
  } catch (ex) {
    console.log(new Error(ex.message));
  }
}());
