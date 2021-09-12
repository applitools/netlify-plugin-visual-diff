# Applitools Visual Diff Netlify Plugin

Check for visual diffs before deploying your site, in various browsers and responsive widths.
Ensure that your CSS still works in all form factors and browsers before deployment, and record
a visual history of your site. And do this without writing a single line of code using this plugin.

This plugin runs the Applitools Eyes visual tests using Cypress and checks
whether the new build is visually different from the previous run.

If you decide that the visual tests should fail your site, then the visual changes
will need to be reviewed and approved in the Applitools Test Manager.
Once they’re approved, rebuilding the site will succeed without errors from this plugin.

## Why

CSS is hard. And so is building sites that work across all form factors. If you want to be sure
that your CSS and HTML changes are not breaking your site, you should check it for visual consistency
by running a visual test.

Has that change in your CSS broken any of the tens of pages in your site? Only a visual diff can make sure
that it hasn't, because going through all of them manually is certainly not an option. And if it was,
you probably would miss something anyway. Only a visual diff would ensure that

## Setup

1. If you're not already, register for Applitools Eyes at <https://applitools.com/register>
1. Login to the Eyes Test Manager at <https://eyes.applitools.com/>
1. Copy your Applitools API key from <https://eyes.applitools.com/>:

1. Create an environment variable in your Netlify site's settings called `APPLITOOLS_API_KEY`:
   * Go to your site's page in Netlify
   * Click on "Site settings"
   * Expand "Build and deploy" in the nav bar on the right
   * Click on "Environment" in the same nav bar, and click on "Edit variables"
   * Add the `APPLITOOLS_API_KEY` variable along with the value you copied from Eyes.
1. In your `netlify.toml`, add the plugin:

   ```toml
   [[plugins]]
     package = "netlify-plugin-visual-diff"
   ```

1. If you need to configure the plugin (see [Configuration](#configuration) below),
   for example, to ignore date-related elements that should
   be ignored in the visual diff, use:

   ```toml
   [[plugins]]
      package = "netlify-plugin-visual-diff"
      [plugins.inputs]
        ignoreSelector = "#today,.copyright"
   ```

1. Decide which browsers and form factors you want to check your site on
   (by default, it will be tested on the latest Chrome, with a 1024x768 viewport), and
   define them in the `netlify.toml`:

   ```toml
   [[plugins]]
    package = "netlify-plugin-visual-diff"
    [plugins.inputs]
      ignoreSelector = "#today,.copyright"

      [[plugins.inputs.browser]]
        name = "chrome"
        width = 1024
        height = 768

      [[plugins.inputs.browser]]
        name = "firefox"
        width = 1920
        height = 1080

      [[plugins.inputs.browser]]
        deviceName = "iPhone X"
   ```

   For a full list of browsers and configurations,
   see <https://www.npmjs.com/package/@applitools/eyes-cypress#configuring-the-browser>

1. That's it! Your next deploys will be visually checked on all the browsers and form factors you specified,
   and if there is a diff, the build will
   fail and a link to the Visual test will be added to the build so that you can verify that
   there is a problem, or approve the changes so that your next build will succeed.

> Note: if you want the visual test not to fail the build but to just execute the visual test
> so that you can see the result in the Eyes Test Manager, add `failBuildOnDiff`
> to the configuration, thus:
>
>  ```toml
>  [[plugins]]
>    package = "netlify-plugin-visual-diff"
>    [plugins.inputs]
>      failBuildOnDiff = false
>  ```

## Configuration

The Netlify Visual Diff plugin is a no-touch solution: you just add it to your `netlify.toml`,
and you're good to go. But it _is_ configurable, using the following configurations:

* `serverUrl`: if you're using the public Applitools server `eyesapi.applitools.com`, there is no
  need to configure this, but if you're an Applitools enterprise user with a dedicated server,
  put the server URL here, e.g. `https://acustomerapi.applitools.com`.
  Default: `https://eyesapi.applitools.com`.
* `ignoreSelector`: if you wish the diff to ignore certain regions when diffiing,
  specify a selector that defines which elements to ignore
  (remember you can have a selector with multiple elements using a `,`),
  e.g. `ignoreSelector = "#today,.copyright"`. Default: none.
* `failBuildOnDiff`: if you wish to only run the Visual test (to see the result in the Eyes
  manager), without it failing the build, set this to `false`, e.g `failBuildOnDiff = false`.
  Default: `true`.
* `concurrency`: specify a higher level of concurrency to make the test faster.
  For more information, see <https://www.npmjs.com/package/@applitools/eyes-cypress#concurrency>.
* `browser`: an array of browsers.
  For more information, see <https://www.npmjs.com/package/@applitools/eyes-cypress#configuring-the-browser>.

The default configuration, if none is specified, is:

```toml
[[plugins]]
  package = "netlify-plugin-visual-diff"
  [plugins.inputs]
    serverUrl = "https://eyesapi.applitools.com" # The public Eyes server
    ignoreSelector = "" # There is no null in TOML, but if there were, then it would be null
    failBuildOnDiff = true
    concurrency = 1
    [[plugins.inputs.browser]]
      name = "chrome"
      width = 1024
      height = 768
```
