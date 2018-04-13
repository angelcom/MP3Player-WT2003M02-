/**
* makecode I2C and Uart MP3Player_WT2003M02 package for microbit.
* From ling.
* http://www.lingsky.net
*/

/**
 * MP3Player_WT2003M02 MP3语音提示模块软件包
 */
//% weight=100 color=#DE6D10 icon=""
namespace MP3Player_WT2003M02 {
    let i2cAddr: number = 0x33 // 0x01  I2C TO UART 默认地址
    let tx = 0, rx = 0   // tx,rx 端口
    let pinMode: number = 0// 0 uart ,1 i2c

    // 填充校验和
    // 累加和校验” 是指长度 + 命令码 + 参数的累加和的低字节。
    function FillCheckSum(cmdBuf: Buffer) {
        let checksum = 0
        for (let i = 1; i < cmdBuf.length - 2; i++) {
            checksum += cmdBuf[i];
        }
        checksum = checksum & 0xFF
        cmdBuf[cmdBuf.length - 2] = checksum;
    }
    
    // 发送命令
    // 注意：“ 长度” 是指长度+命令码+参数+校验和的长度，
    function SendCmd(cmd: number, args: Buffer): number {
        let cmdBuf = pins.createBuffer(5 + args.length)
        cmdBuf[0] = 0x7E
        cmdBuf[1] = cmdBuf.length - 2   // 长度,减去起始结束字节
        cmdBuf[2] = cmd
        cmdBuf[cmdBuf.length - 1] = 0xEF

        for (let i = 0; i < args.length; i++) {
            cmdBuf[i + 3] = args[i];
        }
        FillCheckSum(cmdBuf);

        pins.i2cWriteBuffer(i2cAddr, cmdBuf);

        let ret = pins.i2cReadNumber(i2cAddr, 1);
        return ret;
    }

    /**
     * 初始化 播放器, 设置 I2C 地址。
     * @param address is i2c address for MP3, eg: 0x65 (0x41)
     */
    //% blockId="MP3Player_WT2003M02_Mp3Init" block="初始化MP3，I2C 地址 %address"
    //% weight=100 blockGap=8
    export function Mp3Init(address: number) {
        i2cAddr = address;
    }
    /**
     * 指定 SPI-FLASH 索引播放(全盘)，指定曲目不存在不影响当前播放
     * @param index is 播放的索引开始位置,从1开始计数， eg: 1 
     */
    //% index.min=1 code.max=99
    //% blockId="MP3Player_WT2003M02_Play" block="播放 第 %index 个音频"
    //% weight=100 blockGap=8
    export function Play(index: number) {
        let args = pins.createBuffer(2);
        args[0] = index & 0xF0;
        args[1] = index & 0x0F;
        SendCmd(0xA0, args);
    }
}
