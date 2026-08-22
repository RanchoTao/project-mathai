#!/usr/bin/env python3
from __future__ import annotations

import pathlib
import time
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "people"
OUT.mkdir(parents=True, exist_ok=True)

# 刘文、谢炳昊目前没有确认照片，故意不在此表中。
# 苏伟栋使用用户提供的本地文件 assets/people/su-weidong.jpg，不再从网络抓取。
PEOPLE = {
    "yau-shingtung.jpg": ["https://commons.wikimedia.org/wiki/Special:Redirect/file/Shing-Tung_Yau.jpg"],
    "wu-rongling.jpg": [
        "https://www.bimsa.cn/upload/img/avatar/rlwu_J1yxp.jpg",
        "https://bimsa.net/img/people/IDPhoto/ronglingwu.jpg",
    ],
    "sun-mingming.jpeg": [
        "https://www.bimsa.cn/upload/img/img/people/avatar_panel/MingmingSun_fM7cY.jpeg",
        "https://bimsa.net/img/people/IDPhoto/mingmingsun.jpeg",
    ],
    "wang-zhong.jpg": [
        "https://www.bimsa.cn/upload/img/avatar/zwang_90Aqr.jpg",
        "https://ymsc.tsinghua.edu.cn/__local/8/00/6E/BC215CDFBEB96EC03832B2F72D9_F72C0096_15B13.jpg?e=.jpg",
    ],
    "wang-yaqing.jpg": ["https://www.bimsa.cn/upload/img/img/people/avatar_panel/YaqingWang_ufizi.JPG"],
    "zhao-xin.png": [
        "https://www.bimsa.cn/upload/img/img/people/avatar_panel/XinZhao_NRpBd.png",
        "https://bimsa.net/img/people/IDPhoto/XinZhao.png?v=RrHMn",
    ],
    "shao-jiajia.jpg": ["https://www.bimsa.cn/upload/img/avatar/jshao_la1yq.jpg"],
    "wu-shuang.jpg": ["https://www.bimsa.cn/upload/img/img/people/avatar_panel/wushuang_tJdbV.jpg"],
    "li-jingyan.jpg": ["https://www.bimsa.cn/upload/img/img/people/avatar_panel/jingyanli_wiV3o.jpg"],
    "song-congwei.jpg": ["https://bimsa.net/img/people/IDPhoto/congweisong.jpg"],
    "xie-haihua.jpg": ["https://www.bimsa.cn/upload/img/img/people/avatar_panel/haihuaxie_32Hi1.JPG"],
    "song-jiebo.jpg": ["https://www.bimsa.cn/upload/img/img/people/avatar_panel/songjiebo_0BJRP.jpg"],
    "zhang-liping.jpg": ["https://www.bimsa.cn/upload/img/avatar/lpzhang_62aNp.jpg"],
    "he-miao.jpg": ["https://www.bimsa.cn/upload/img/img/people/avatar_panel/miaohe_9Mxqe.jpg"],
    "feng-qi.jpg": ["https://www.bimsa.cn/upload/img/img/people/avatar_panel/QiFeng_Jylii.jpg"],
    "guan-lingyong.jpeg": ["https://mayuan.bucea.edu.cn/images/2025-05/95f30a06ba2f454ebb7e6d4f462e9c05.jpeg"],
    "zhang-hang.jpg": ["https://faculty.bucea.edu.cn/pub/zhanghang/images/202303311939103910.JPG"],
    "wang-qiongzhi.jpeg": ["https://mayuan.bucea.edu.cn/images/2025-05/8638c5ff6e8c4d7ab020539e864b51f9.jpeg"],
}


def looks_like_image(data: bytes) -> bool:
    return len(data) > 1200 and (
        data.startswith(b"\xff\xd8\xff")
        or data.startswith(b"\x89PNG\r\n\x1a\n")
        or data.startswith(b"GIF87a")
        or data.startswith(b"GIF89a")
        or (data[:4] == b"RIFF" and data[8:12] == b"WEBP")
    )


def fetch(url: str) -> bytes:
    host = urllib.parse.urlparse(url).netloc
    referer = "https://www.bimsa.cn/" if "bimsa" in host else (
        "https://www.bucea.edu.cn/" if "bucea" in host else "https://www.google.com/"
    )
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Referer": referer,
    })
    with urllib.request.urlopen(req, timeout=35) as response:
        return response.read()


def proxy_url(url: str) -> str:
    clean = url.removeprefix("https://").removeprefix("http://")
    return "https://wsrv.nl/?" + urllib.parse.urlencode({
        "url": clean,
        "output": "jpg",
        "w": "600",
        "h": "600",
        "fit": "cover",
        "a": "attention",
    })


def vendor(name: str, sources: list[str]) -> bool:
    target = OUT / name
    candidates = []
    for src in sources:
        candidates.extend([src, proxy_url(src)])

    errors = []
    for url in candidates:
        try:
            data = fetch(url)
            if not looks_like_image(data):
                raise ValueError(f"not an image ({len(data)} bytes)")
            target.write_bytes(data)
            print(f"[ok] {name} <- {url} ({len(data)} bytes)")
            return True
        except Exception as exc:
            errors.append(str(exc))
            print(f"[retry] {name}: {url}: {exc}")
            time.sleep(.5)

    if target.exists() and looks_like_image(target.read_bytes()):
        print(f"[keep] {name}: retaining existing local portrait")
        return True

    print(f"[missing] {name}: " + " | ".join(errors[-3:]))
    return False


def main() -> None:
    ok = 0
    missing = []
    for name, sources in PEOPLE.items():
        if vendor(name, sources):
            ok += 1
        else:
            missing.append(name)
    print(f"Vendored {ok}/{len(PEOPLE)} network portraits.")
    if missing:
        print("Still missing: " + ", ".join(missing))


if __name__ == "__main__":
    main()
