<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

This project is amplify plugin to add notifications to Slack for ther build result from AWS Amplify Console.

You can add email notifications to notify stakeholders when a build succeeds or fails. But, cannot notify to Chat service (e.g. Slack).
If you use this plugin, You can add feature to notify Slack to your amplify project backend.

<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

First, install AWS Amplify CLI using npm (we assume you have pre-installed node.js).

```sh
npm install -g @aws-amplify/cli
```

Second, create Slack Incoming Webhook. See [here](https://api.slack.com/messaging/webhooks#getting_started) for more information.
Later, input your Incoming Webhook URL when prompt to input webhook from amplify cli.

### Installation

1. Install NPM packages
   ```sh
   npm install -g amplify-category-console-notification
   ```
2. Enable this plugin
   ```sh
   amplify plugin scan
   ```

<!-- USAGE EXAMPLES -->
## Usage

```bash
$ amplify console-notification add
Using service: AmplifyConsoleNotification, provided by: awscloudformation
? Input function name in order to send message to Slack. Sender
? Input Web hook URL of Slack. https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
Successfully added resource Sender locally
```

## Commands Summary

The following table lists the current set of commands supported by the Amplify Console Notification Category Plugin.

| Command              | Description |
| --- | --- |
| amplify consolenotification add | Takes you through steps in the CLI to add some resources for notifications to your backend. |
| amplify consolenotification remove | Removes resources for notifications from your local backend. The resources are removed from the cloud on the next push command. |

<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/fossamagna/amplify-category-console-notification/issues) for a list of proposed features (and known issues).

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->
## License

Distributed under the Apache-2.0 License. See `LICENSE` for more information.

<!-- CONTACT -->
## Contact

Masahiko MURAKAMI - [@fossamagna](https://twitter.com/fossamagna)

Project Link: [https://github.com/fossamagna/amplify-category-console-notification](https://github.com/fossamagna/amplify-category-console-notification)

## Acknowledgements

- [Amplify Console のビルド通知をSlackで受け取るためにやったこと](https://speakerdeck.com/youta1119/amplify-console-falsebirudotong-zhi-woslackdeshou-kequ-rutameniyatutakoto) (Japanese)