import { NextResponse } from "next/server";
import { selectLottery } from "../model/ticketBuy"

export async function GET(req, res) {
    try {
        const result = await selectLottery()
        return NextResponse.json(result)
    } catch (error) {
        console.log(error)
    }
}