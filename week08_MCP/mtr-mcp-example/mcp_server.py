import requests
from typing import Dict
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("mtr_next_train")

@mcp.tool()
def get_next_train_schedule(line: str, sta: str, lang: str = "EN") -> Dict:
    """
    Get the next train arrival schedule for an MTR line and station.
    
    Args:
        line: MTR line code. Valid values:
            - AEL: Airport Express (HOK, KOW, TSY, AIR, AWE)
            - TCL: Tung Chung Line (HOK, KOW, OLY, NAC, LAK, TSY, SUN, TUC)
            - TML: Tuen Ma Line (WKS, MOS, HEO, TSH, SHM, CIO, STW, CKT, TAW, HIK, DIH, KAT, SUW, TKW, HOM, HUH, ETS, AUS, NAC, MEF, TWW, KSR, YUL, LOP, TIS, SIH, TUM)
            - TKL: Tseung Kwan O Line (NOP, QUB, YAT, TIK, TKO, LHP, HAH, POA)
            - EAL: East Rail Line (ADM, EXC, HUH, MKK, KOT, TAW, SHT, FOT, RAC, UNI, TAP, TWO, FAN, SHS, LOW, LMC)
            - SIL: South Island Line (ADM, OCP, WCH, LET, SOH)
            - TWL: Tsuen Wan Line (CEN, ADM, TST, JOR, YMT, MOK, PRE, SSP, CSW, LCK, MEF, LAK, KWF, KWH, TWH, TSW)
            - ISL: Island Line (KET, HKU, SYP, SHW, CEN, ADM, WAC, CAB, TIH, FOH, NOP, QUB, TAK, SWH, SKW, HFC, CHW)
            - KTL: Kwun Tong Line (WHA, HOM, YMT, MOK, PRE, SKM, KOT, LOF, WTS, DIH, CHH, KOB, NTK, KWT, LAT, YAT, TIK)
            - DRL: Disneyland Resort Line (SUN, DIS)
        sta: Station code for the specified line (must be valid for the line chosen).
        lang: Language - 'EN' for English or 'TC' for Traditional Chinese. Default: 'EN'.
    
    Returns:
        JSON response with train schedule including:
        - sys_time: System timestamp
        - curr_time: Current timestamp
        - data: Train schedule with UP/DOWN directions
        - status: 1 for success, 0 for special message
        - message: Status message
        - isdelay: 'Y' if service delay, 'N' otherwise
        
        Returns error dict if API request fails.
    """
    url = f"https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line={line}&sta={sta}&lang={lang}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"API request failed with status {response.status_code}"}

if __name__ == "__main__":
    # FastMCP now uses 'sse' transport (HTTP+SSE is default)
    # It will run on http://localhost:8000 by default
    # You can set host/port via environment variables or uvicorn config
    mcp.run(transport='sse')