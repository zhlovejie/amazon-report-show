import MD5 from "crypto-js/MD5";
import deepseek_parse_pdf from "@/utils/request";

function md5WithChinese(str: string) {
  let _str = str.trim().toLocaleLowerCase();
  return MD5(_str).toString();
}

/**
 * 大模型返回比较慢，这里对文件进行了缓存
 * @param file
 * @returns
 */
async function getAdsFromCache(file: File) {
  const __key__ = "__ads_cache__";
  const __file_key__ = md5WithChinese(file.name);
  const cacheData = window.localStorage.getItem(__key__);

  let cacheAdsDataList: { [key: string]: any } = {};
  if (cacheData) {
    try {
      cacheAdsDataList = JSON.parse(cacheData);
      if (cacheAdsDataList[__file_key__]) {
        console.warn("从缓存获取广告数据");
        return cacheAdsDataList[__file_key__];
      }
      const adsData = await deepseek_parse_pdf(file);
      cacheAdsDataList[__file_key__] = adsData;
      window.localStorage.setItem(__key__, JSON.stringify(cacheAdsDataList));
      return adsData;
    } catch (err) {
      console.error(err);

      console.log("请求请求大模型");
      const adsData = await deepseek_parse_pdf(file);
      window.localStorage.setItem(
        __key__,
        JSON.stringify({
          [__file_key__]: adsData,
        }),
      );
      return adsData;
    }
  } else {
    console.warn("从大模型接口获取广告数据");
    const adsData = await deepseek_parse_pdf(file);
    window.localStorage.setItem(
      __key__,
      JSON.stringify({
        [__file_key__]: adsData,
      }),
    );
    return adsData;
  }
}

export { md5WithChinese, getAdsFromCache };
