# Star-AI Desktop

Windows Electron application and Inno Setup installer.

## Build and publish

1. Open the **Actions** tab in this repository.
2. Select **Build and publish Star-AI Desktop**.
3. Click **Run workflow**.
4. Enter the desired version (for example `2.202.0`) and choose `stable` or `beta`.
5. Run the workflow. It builds x64 and x86 portable apps, compiles the Inno Setup installer, and publishes a GitHub Release.

The workflow runs on a GitHub-hosted Windows runner. Do not commit `.env`, API keys, credentials, `node_modules`, or generated release files.
