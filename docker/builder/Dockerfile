
#------------------------------------------------< Builder >------------------------------------------------------------
#
# Note: This docker is build locally. The goal is to provide a ready to use docker to compile this project.
#
#-----------------------------------------------------------------------------------------------------------------------
FROM ubuntu:20.04
MAINTAINER berenger.dalle-cort@geomatys.com

# Define paths and versions
ENV OPEN_JDK_VERSION="8"
ENV NODEJS_VERSION="12"
ENV GRADLE_VERSION="6.5.1"
ENV ANDROID_SDK_ROOT="/opt/android"
ENV ANDROID_VERSION="28"
ENV ANDROID_COMMAND_LINE_TOOLS_URL="https://nexus.geomatys.com/repository/raw-public/binaries/google/android/commandlinetools-linux-6609375_latest.zip"

# Install system dependencies
RUN apt update
RUN apt -y upgrade
RUN apt -y install openjdk-${OPEN_JDK_VERSION}-jdk unzip curl dirmngr apt-transport-https lsb-release ca-certificates

# Install Chrome (for headless testing)
RUN apt -y install fonts-liberation libappindicator3-1 libgbm1 wget xdg-utils
RUN curl https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb > chrome.deb
RUN dpkg -i chrome.deb
RUN rm chrome.deb

# Install Gradle
RUN apt -y install zip
RUN curl -s "https://get.sdkman.io" | bash
RUN /bin/bash --login -c "source $HOME/.sdkman/bin/sdkman-init.sh && sdk install gradle ${GRADLE_VERSION}"

# Install NodeJS 12 and NPM (to build application)
RUN curl -sL https://deb.nodesource.com/setup_${NODEJS_VERSION}.x | bash -
RUN apt-get install nodejs  -y
RUN echo `node --version`
RUN echo `npm --version`

# Install android commandline and sdk (to build final APK)
RUN curl $ANDROID_COMMAND_LINE_TOOLS_URL > file.zip
RUN mkdir -p "${ANDROID_SDK_ROOT}/cmdline-tools"
RUN unzip file.zip -d "${ANDROID_SDK_ROOT}/cmdline-tools"
RUN rm file.zip
RUN chmod 755 -R $ANDROID_SDK_ROOT
ENV PATH="${ANDROID_SDK_ROOT}/platform-tools/bin:${PATH}"
ENV PATH="${ANDROID_SDK_ROOT}/cmdline-tools/tools/bin:${PATH}"
RUN yes | sdkmanager --licenses
RUN yes | sdkmanager "platform-tools"
RUN yes | sdkmanager "platforms;android-${ANDROID_VERSION}"
