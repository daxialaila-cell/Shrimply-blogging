hexo.on('ready', () => {
    const { version } = require('../../package.json')
    const logo = `
       #####  ####  #     #####  ###### #     # ######   ######
      #      #    # #       #      #    #     # #      # #
       ##### #    # #       #      #    #     # #      # ######
           # #    # #       #      #    #     # #      # #
      ######  ####  ##### #####    #      ###   ######   ######
    `.replace(/#/g, '●')
    const message = `
  \x1b[38;5;45m==========================[ Shrimply Blogging ]==========================\x1b[0m
  \x1b[38;5;45m${logo}\x1b[0m
                         \x1b[38;5;45m version: ${version}\x1b[0m
  \x1b[38;5;45m======================================================================\x1b[0m
         \x1b[38;5;45mhttps://github.com/daxialaila-cell/Shrimply-blogging\x1b[0m
  `
    hexo.log.info(message)
})
