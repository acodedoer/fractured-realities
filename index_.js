
        const config = {
            src: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/open-peeps-sheet.png',
            rows: 15,
            cols: 7
          }
        const source = document.createElement('img');
        source.src=config.src;
        const canvas = document.createElement('canvas')
        var imgwidth = source.offsetWidth/7;
        var imgheight = source.offsetHeight/15;
        canvas.width = 256;
        canvas.height = 320;
        const context =canvas.getContext('2d');
        context.drawImage(source, 256*5,320*4);
        document.querySelector('body').appendChild(canvas)