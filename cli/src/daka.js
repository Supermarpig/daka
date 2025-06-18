const { sleep } = require('./utils/resource');

class Daka {
  constructor({ dakaModule, username, password, maxRetryCount, punchType }) {
    this.dakaModule = dakaModule;
    this.username = username;
    this.password = password;
    this.retryCount = 0;
    this.maxRetryCount = maxRetryCount;
    this.punchType = punchType;
  }

  punch = async () => {
    try {
      await this.dakaModule.login({
        username: this.username,
        password: this.password,
      });

      const isDakaDay = await this.dakaModule.checkDakaDay({
        punchType: this.punchType,
      });

      if (isDakaDay) await this.dakaModule.punch({ punchType: this.punchType });
    } catch (e) {
      console.log('Error:', e);

      if (this.retryCount < this.maxRetryCount) {
        // 檢查是否為頻率限制錯誤
        const isContinuousCheckInError = e.message && e.message.includes('PT_PlsDonotContinuousCheckIn');
        
        if (isContinuousCheckInError) {
          console.log('Frequency limit detected, waiting 65 seconds before retry...');
          this.retryCount += 1;
          await sleep(65000); // 等待65秒（多於1分鐘）
        } else {
          console.log('Some error happen, retry in 3 secs');
          this.retryCount += 1;
          await sleep(3000);
        }

        await this.punch();
      }
    }

    await this.dakaModule.logout();
  };
}

module.exports = Daka;
