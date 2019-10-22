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
// browser.get('http://en.wikipedia.org/wiki/Wiki');
// browser.findElements(webdriver.By.css('[href^="/wiki/"]')).then(function(links){
//     console.log('Found', links.length, 'Wiki links.' )
// });

(async function test() {
    try {
        describe ('Git bot automated tests', async function () {
            this.timeout(50000);

            beforeEach (async () => {
                browser = new webdriver.Builder().usingServer().withCapabilities({'browserName': 'chrome' }).build();
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
        });
    } catch (ex) {
        console.log (new Error(ex.message));
    } finally {

    }
})();