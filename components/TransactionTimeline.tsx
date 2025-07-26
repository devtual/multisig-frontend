import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./Card"
import { Clock } from 'lucide-react'

export default function TransactionTimeline() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Execution Timeline
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Submit</span>
                        <span>Immediate</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Collect Signatures</span>
                        <span>24-48 hours</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Execute</span>
                        <span>When threshold met</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
