import Link from "next/link"
import { usePathname } from "next/navigation"
import MenuItem from "./MenuItem"
import MenuItemFollow from "./MenuItemFollow"
import { useEffect } from "react"
import { useUser } from "@/app/context/user"
import ClientOnly from "@/app/components/ClientOnly"
import { useGeneralStore } from "@/app/stores/general"
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

export default function SideNavMain() {

    let { setRandomUsers, randomUsers} = useGeneralStore()

    const contextUser = useUser()
    const pathname = usePathname()

    useEffect(() => { setRandomUsers() }, [])

    useEffect(() => {
        document.addEventListener('DOMContentLoaded', () => {
            const appDiv = document.getElementById('live');
            if (appDiv) {
                init(appDiv);
            }
        });
    }, []);

    const handleStartLiveStreaming = () => {
        const appDiv = document.getElementById('live');
        if (appDiv) {
            init(appDiv);
        }
    };

    return (
        <>
            <div 
                id="SideNavMain" 
                className={`
                    fixed z-20 bg-white pt-[70px] h-full lg:border-r-0 border-r w-[75px] overflow-auto
                    ${pathname === '/' ? 'lg:w-[310px]' : 'lg:w-[220px]'}
                `}
            >
                
                <div className="lg:w-full w-[55px] mx-auto">
                    <Link href="/">
                        <MenuItem 
                            iconString="For You" 
                            colorString={pathname == '/' ? '#F02C56' : ''} 
                            sizeString="25"
                        />
                    </Link>
                    <MenuItem iconString="Following" colorString="#000000" sizeString="25"/>
                    <button id='live' onClick={handleStartLiveStreaming}>
                        <MenuItem iconString="LIVE" colorString="#000000" sizeString="25"/>
                    </button>
                    

                    <div className="border-b lg:ml-2 mt-2" />
                    <h3 className="lg:block hidden text-xs text-gray-600 font-semibold pt-4 pb-2 px-2">Suggested accounts</h3>

                    <div className="lg:hidden block pt-3" />
                    <ClientOnly>
                        <div className="cursor-pointer">
                            {randomUsers?.map((user, index) => ( 
                                <MenuItemFollow key={index} user={user} /> 
                            ))}
                        </div>
                    </ClientOnly>

                    <button className="lg:block hidden text-[#F02C56] pt-1.5 pl-2 text-[13px]">See all</button>

                    {contextUser?.user?.id ? (
                        <div >
                            <div className="border-b lg:ml-2 mt-2" />
                            <h3 className="lg:block hidden text-xs text-gray-600 font-semibold pt-4 pb-2 px-2">Following accounts</h3>

                            <div className="lg:hidden block pt-3" />
                            <ClientOnly>
                                <div className="cursor-pointer">
                                    {randomUsers?.map((user, index) => ( 
                                        <MenuItemFollow key={index} user={user} /> 
                                    ))}
                                </div>
                            </ClientOnly>

                            <button className="lg:block hidden text-[#F02C56] pt-1.5 pl-2 text-[13px]">See more</button>
                        </div>
                    ) : null}
                    <div className="lg:block hidden border-b lg:ml-2 mt-2" />

                    <div className="lg:block hidden text-[11px] text-gray-500">
                        <p className="pt-4 px-2">About Newsroom FIMA Shop Contact FIMA Developers</p>
                        <p className="pt-4 px-2">FIMA for Good Advertise Developers Transparency FIMA Rewards FIMA Browse FIMA Embeds</p>
                        <p className="pt-4 px-2">Help Safety Terms Privacy Creator Portal Community Guidelines</p>
                        <p className="pt-4 px-2">© 2024 FIMA</p>
                    </div>

                    <div className="pb-14"></div>
                </div>

            </div>
        </>
    )
}

// get token
//! You need generate a token using your own backend api!
//! Please refer to https://docs.zegocloud.com/article/14741 for more information.
function generateToken(tokenServerUrl: string, userID: string) {
    // Obtain the token interface provided by the App Server
    return fetch(
      `${tokenServerUrl}/access_token?userID=${userID}&expired_ts=7200`,
      {
        method: 'GET',
      }
    ).then((res) => res.json());
}

function randomID(len: number) {
    let result = '';
    if (result) return result;
    var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
      maxPos = chars.length,
      i;
    len = len || 5;
    for (i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return result;
}

function getUrlParams(url: string) {
    let urlStr = url.split('?')[1];
    const urlSearchParams = new URLSearchParams(urlStr);
    const result = Object.fromEntries(urlSearchParams.entries());
    return result;
}

async function init(appDiv: HTMLElement) {
    const roomID = getUrlParams(window.location.href)['roomID'] || randomID(5);
    let role = getUrlParams(window.location.href)['role'] || 'Host';
    role =
      role === 'Host'
        ? ZegoUIKitPrebuilt.Host
        : role === 'Cohost'
        ? ZegoUIKitPrebuilt.Cohost
        : ZegoUIKitPrebuilt.Audience;
  
    let sharedLinks = [];
    if (role === ZegoUIKitPrebuilt.Host || role === ZegoUIKitPrebuilt.Cohost) {
      sharedLinks.push({
        name: 'Join as co-host',
        url:
          window.location.origin +
          window.location.pathname +
          '?roomID=' +
          roomID +
          '&role=Cohost',
      });
    }
    sharedLinks.push({
      name: 'Join as audience',
      url:
        window.location.origin +
        window.location.pathname +
        '?roomID=' +
        roomID +
        '&role=Audience',
    });
  
    const userID = randomID(5);
    const userName = randomID(5);
    const { token } = await generateToken(
      'https://nextjs-token.vercel.app/api',
      userID
    );
    const KitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
      1484647939 , // You need to replace the appid with your own appid
      token,
      roomID,
      userID,
      userName
    );
    const zp = ZegoUIKitPrebuilt.create(KitToken);
    zp.joinRoom({
      container: appDiv,
      branding: {
        logoURL:
          'https://www.zegocloud.com/_nuxt/img/zegocloud_logo_white.ddbab9f.png',
      },
      scenario: {
        mode: ZegoUIKitPrebuilt.LiveStreaming,
        
      },
      sharedLinks,
      onLeaveRoom: () => {
        // do do something
      },
      showUserList: true,
    });
}
