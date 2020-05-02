# netlify-plugin-visual-diff

Check for visual diffs before deploying your site.

This plugin will run Applitools visual diff tests using Cypress and fail the build if the new build is visually different from the previous run.

Visual changes will need to be reviewed and approved in Applitools. Once they’re approved, rebuilding the site will succeed without errors from this plugin.

## Why?

If you want to be extra sure that visual changes are intentional, this provides an automated check that highlights all visual changes for review and manual approval.

It’s probably not right for every project, but it’s great if you work on a critical web property and need to be extra super duper pooper sure that visual changes only happen when you want them to.

## Setup

> NOTE: Before making these changes, you’ll need to [enable the Build Plugins Beta](https://app.netlify.com/enable-beta?_ga=2.121904395.1859585997.1588375642-1789055271.1572451542).

1. Get your Applitools API key from https://eyes.applitools.com/
2. Create an environment variable in your Netlify settings called `APPLITOOLS_API_KEY`
3. In your `netlify.toml`, add the plugin:

  ```toml
  [[plugins]]
    package = "netlify-plugin-visual-diff"
  ```

## Known Issues

- [ ] There’s no way to ignore it — not sure if there should be, but it’s worth discussing
