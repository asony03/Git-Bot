const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
process.on('unhandledRejection', () => {});


var webdriver = require('selenium-webdriver');
var browser;

var githubLoginLink = "https://github.com/login";
var userName = "khanshariquem";
var password = "juit@101311";
var repository = "GitBot-Test";
var issueName = "GitBot-Test-Issue" + Date.now();
var issueComment = "GitBot-Test-Comment"+ Date.now();

var slackLoginLink = "https://slack.com/signin";
var slackworkspace = "freefolk-at-ncsu";
var slackUserName = "mkhan8@ncsu.edu";
var slackPassword = "password@123";
var slackChannel = "se-project";


var chromeCapabilities = webdriver.Capabilities.chrome();
var chromeOptions = {
    'args': ['--no-sandbox']
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
                await browser.findElement(webdriver.By.xpath("(//div[@role='search' and @aria-label='Repositories' ]/input)[1]")).sendKeys(repository);
                await browser.sleep(1000);  
                await browser.findElement(webdriver.By.xpath("(//div[@class='js-repos-container']//li[contains(.,'"+repository+"')]//a)[1]")).click();
                await browser.sleep(1000); 
                await browser.findElement(webdriver.By.xpath("(//a//span[contains(., 'Issues')]//parent::a)")).click(); 
                await browser.findElement(webdriver.By.xpath("//a[@role='button' and contains(., 'New issue')]")).click();
                await browser.findElement(webdriver.By.id("issue_title")).sendKeys(issueName);
                await browser.findElement(webdriver.By.xpath("(//button[@type='submit' and contains(., 'Submit new issue')])[1]")).click();
                await browser.sleep(2000);
                await browser.navigate().refresh();
                var labels = await browser.findElement(webdriver.By.xpath("//details[@id='labels-select-menu']/parent::div/div")).getText();
                expect(labels).to.not.include('None yet');
            });

            it ('find the rpository, Comment on an issue and validate slack integration', async () => {
                //issueName = 'GitBot-Test-Issue1571727951325';
                //comment on the issue created in first test
                await browser.findElement(webdriver.By.xpath("(//div[@role='search' and @aria-label='Repositories' ]/input)[1]")).sendKeys(repository);
                await browser.sleep(1000);  
                await browser.findElement(webdriver.By.xpath("(//div[@class='js-repos-container']//li[contains(.,'"+repository+"')]//a)[1]")).click();
                await browser.sleep(1000); 
                await browser.findElement(webdriver.By.xpath("(//a//span[contains(., 'Issues')]//parent::a)")).click(); 
                await browser.findElement(webdriver.By.xpath("//div[@aria-label='Issues']//a[contains(., '"+issueName+"')]")).click();
                await browser.findElement(webdriver.By.id("new_comment_field")).sendKeys(issueComment);
                await browser.findElement(webdriver.By.xpath("//button[@type='submit' and contains(.,'Comment')]")).click(); 
                
                //slack integration
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