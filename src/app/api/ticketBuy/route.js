import { NextResponse } from "next/server";
import { selectLottery, selectLotteryEspecial, selectLotterySerie } from "../model/ticketBuy"

export async function GET(req, res) {
    try {
        const result = await selectLottery()
        return NextResponse.json(result)
    } catch (error) {
        console.log(error)
    }
}
export async function POST(req, res) {
    try {
        const result = await selectLotterySerie()
        return NextResponse.json(result)

    } catch (error) {
        console.log(error)
    }
}
export async function PUT(req, res) {
    try {
        const result = await selectLotteryEspecial()
        return NextResponse.json(result)
    } catch (error) {
        console.log(error)
    }
}