import fetch from 'node-fetch';
import express from 'express';
import * as cheerio from 'cheerio';

const router = express.Router();

router.get('/AnimeArab', async (req, res) => {
  try {
    const { q, s, e } = req.query;

    if (!q) {
      return res.status(400).json({ 
        status: false,
        author: '⛊ 𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
        message: 'يرجى تقديم نص للبحث عبر q.',
      });
    }

    const searchResults = await animearab.search(q);
    if (!searchResults.length) {
      return res.status(404).json({
        status: false,
        author: '⛊ 𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
        message: 'لم يتم العثور على نتائج.',
      });
    }

    // فقط q: نعرض نتائج البحث
    if (s === undefined) {
      return res.status(200).json({
        status: true,
        author: '⛊ 𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
        message: 'تم العثور على النتائج، اختر s لعرض معلومات الأنمي.',
        results: searchResults.map((r, i) => ({ index: i, title: r.title, altTitle: r.altTitle, link: r.link }))
      });
    }

    const selectedIndex = parseInt(s);
    const selectedResult = searchResults[selectedIndex];
    if (!selectedResult) {
      return res.status(400).json({
        status: false,
        message: `لا توجد نتيجة في الفهرس ${selectedIndex}`,
      });
    }

    const animeInfo = await animearab.parts(selectedResult.link);

    // إذا لم يدخل e، نعرض الحلقات فقط
    if (e === undefined) {
      return res.status(200).json({
        status: true,
        author: '⛊ 𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
        message: 'تم العثور على معلومات الأنمي، اختر e لعرض معلومات الحلقة.',
        animeInfo: {
          title: animeInfo.title,
          status: animeInfo.status,
          episodesCount: animeInfo.episodesList.length,
          episodes: animeInfo.episodesList.map((ep, i) => ({
            index: i,
            episodeNumber: ep.episodeNumber,
            title: ep.episodeTitle
          }))
        }
      });
    }

    const episodeIdx = parseInt(e);
    const selectedEpisode = animeInfo.episodesList[episodeIdx];
    if (!selectedEpisode) {
      return res.status(400).json({
        status: false,
        message: `لا توجد حلقة في الفهرس ${episodeIdx}`,
      });
    }

    const episodeDetails = await animearab.download(selectedEpisode.episodeLink);

    return res.status(200).json({
      status: true,
      author: '⛊ 𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
      message: 'تم تحميل معلومات الحلقة بنجاح.',
      animeTitle: animeInfo.title,
      episode: selectedEpisode,
      episodeDetails
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      author: '⛊ 𝚂𝙰𝚈𝙴𝙳-𝚂𝙷𝙰𝚆𝙰𝚉𝙰',
      message: 'حدث خطأ أثناء التحميل.',
      error: error.message,
    });
  }
});


  
const usedRouterKeys = {
  tag: "AnimeArab",
  model: "anime3rb",
  description: "Search, watch and download anime episodes.",
  query: { 
    q: "Anime name",
  },
  limited: 2,
  status: true,
  price: "free"
};

export { usedRouterKeys };

export default router;

//throw new Error(`خطأ أثناء جلب البيانات: ${error.message}`);

> const webUrl = 'https://anime3rb.com/';
const animearab = {
    search: async (pompart) => {
        const response = await fetch(`${webUrl}search?q=${encodeURIComponent(pompart)}`);
        const html = await response.text();
        const $ = cheerio.load(html);
        const results = [];
        
        $('div.search-results a').each((index, element) => {
            const title = $(element).find('h4').text().trim();
            const altTitle = $(element).find('h5').text().trim();
            const link = $(element).attr('href');
            const image = $(element).find('img').attr('src');
            const rating = $(element).find('span:contains("التقييم")').text().trim();
            const episodes = $(element).find('span:contains("حلقات")').text().trim();
            const releaseDate = $(element).find('span').last().text().trim();

            results.push({ title, altTitle, link, image, rating, episodes, releaseDate });
        });
        
        return results;
    },
    parts: async (item) => {
        const response = await fetch(item);
        const html = await response.text();
        const $ = cheerio.load(html);

        const animeInfo = {
            title: $('h1.text-2xl.font-bold').text().trim(),
            status: $('td:contains("الحالة:")').next().text().trim(),
            release: $('td:contains("إصدار:")').next().text().trim(),
            studio: $('td:contains("الاستديو:")').next().find('a').text().trim(),
            author: $('td:contains("المؤلف:")').next().find('a').text().trim(),
            rating: $('p.font-light:contains("التقييم")').next().text().trim(),
            episodes: $('p.font-light:contains("الحلقات")').next().text().trim(),
            ageRating: $('p.font-light:contains("التصنيف العمري")').next().text().trim(),
            description: $('.py-4 p').first().text().trim(),
            otherNames: $('.flex.flex-wrap.gap-1.5 h2').map((i, el) => $(el).text().trim()).get(),
            episodesList: []
        };

        $('.videos-container a').each((i, el) => {
            animeInfo.episodesList.push({
                episodeNumber: $(el).find('.video-metadata span').text().trim(),
                episodeTitle: $(el).find('.video-metadata p').text().trim(),
                episodeLink: $(el).attr('href'),
                episodeThumbnail: $(el).find('img').attr('src'),
                episodeDuration: $(el).find('span.rounded').text().trim()
            });
        });

        return animeInfo;
    },
    download: async (part) => {
        const response = await fetch(part);
        const html = await response.text();
        const $ = cheerio.load(html);

        const episodeInfo = {
            title: $('h1.text-lg.xl\\:font-semibold a').text().trim(),
            description: $('h2.text-lg.font-light').text().trim(),
            views: $('div.flex-shrink-0 span').first().text().trim(),
            videoUrl: $('iframe').attr('src'),
            downloadLinks: []
        };

        $('.divide-y .flex-grow a').each((index, element) => {
            const quality = $(element).closest('div').find('label').text().trim();
            const link = $(element).attr('href');
            episodeInfo.downloadLinks.push({ quality, link });
        });

        return episodeInfo;
    }
};

/*

const search = await animearab.search('Naruto')
const info = await animearab.parts(search[0].link)
const download = await animearab.download(info.episodesList[0].episodeLink)

await m.reply(JSON.stringify(download, null, 2))

*/
