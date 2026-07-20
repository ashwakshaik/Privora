const os = require('os');

// Monkey-patch os.hostname to return an ASCII hostname
os.hostname = () => 'PRIVORA-BUILD';

// Monkey-patch os.userInfo to return ASCII details
const originalUserInfo = os.userInfo;
os.userInfo = function(options) {
  try {
    const info = originalUserInfo.call(this, options);
    return {
      ...info,
      username: 'Ashwak',
      homedir: 'C:\\Users\\Ashwak'
    };
  } catch (e) {
    return {
      uid: -1,
      gid: -1,
      username: 'Ashwak',
      homedir: 'C:\\Users\\Ashwak',
      shell: null
    };
  }
};

console.log('[OS Patch] Successfully patched os.hostname and os.userInfo');
